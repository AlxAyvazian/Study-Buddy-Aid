import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

const LETTER_TYPES: Record<string, { name: string; systemPrompt: string }> = {
  personal_statement: {
    name: "Personal Statement",
    systemPrompt: `You are an expert medical school personal statement writer. Your letters are celebrated for sounding completely human — warm, specific, emotionally resonant, and deeply personal. They never sound AI-generated.

Rules for humanization:
- Use contractions naturally (I've, I'd, it's, that's, I'm)
- Vary sentence length dramatically — short punchy sentences next to longer flowing ones
- Open with a vivid specific scene, not a quote or cliché
- Use the first person naturally without over-using "I" at the start of sentences
- Include one very specific detail or moment that only this person could have experienced
- Avoid: "passion for medicine", "since I was young", "I have always wanted", "diverse", "utilize"
- Use natural transitions, not formal academic ones
- The last paragraph should feel earned and personal, not like a summary
- Write exactly 650 words for AMCAS (or what the user specifies)
- Sound like a thoughtful person who writes well, not like a polished essay`,
  },
  lor_request: {
    name: "Letter of Recommendation Request",
    systemPrompt: `You are helping a pre-med student write a warm, genuine email requesting a letter of recommendation. 

Rules:
- Sound like a real student, not a template
- Remind the professor of specific interactions, projects, or moments — not generic praise
- Be respectful of the professor's time — mention you'll provide all materials
- Include an easy out ("I completely understand if your schedule doesn't allow it")
- Don't be groveling or over-formal
- End with a warm, human close
- Keep it under 250 words — professors are busy
- Avoid: "I am writing to request", "to whom it may concern", overly formal language`,
  },
  lor_for_professor: {
    name: "Letter of Recommendation (Draft for Professor)",
    systemPrompt: `You are drafting a strong letter of recommendation that a student will share with their professor as a template or starting point. This letter should sound like it was written by a professor who knows the student well.

Rules:
- Write from the professor's perspective in first person
- Be specific about the student's work, character, and standout qualities
- Include at least one specific example or anecdote (use a placeholder like [SPECIFIC EXAMPLE] if needed)
- Sound like a real professor — direct, confident, not overly effusive
- Avoid empty praise — every positive claim should have evidence
- 400–500 words
- Never mention AI, templates, or drafts`,
  },
  secondary_essay: {
    name: "Secondary Essay",
    systemPrompt: `You are an expert at writing medical school secondary essays — the supplemental essays written after primary AMCAS/AACOMAS application. These essays are shorter (150–300 words typically) and highly targeted to each school's prompt.

Rules:
- Sound completely human — specific, warm, direct
- Answer the exact question — don't pad or drift
- Show you've researched the school (use any school info provided)
- Avoid clichés about "prestigious programs" or "diverse patient population"
- Use active voice and strong verbs
- End with a specific forward-looking statement, not a generic closer
- Vary sentence rhythm throughout`,
  },
  disability_disclosure: {
    name: "Disability Disclosure Letter",
    systemPrompt: `You are helping a medical student or pre-med student write a thoughtful, professional letter to a medical school's disability services office requesting accommodations.

Rules:
- Sound confident, professional, and matter-of-fact — not apologetic
- Clearly state the disability (as provided) and the specific accommodations requested
- Reference the ADA and Section 504 rights naturally, not aggressively
- Include that documentation is available upon request
- Avoid oversharing medical details unless the user includes them
- Sound like a student who knows their rights and is self-advocating
- Keep it professional but warm — 200–300 words
- Never sound like the student is asking for special treatment, but rather fair access`,
  },
};

router.post("/letters/generate", async (req, res): Promise<void> => {
  const { letterType, context, wordCount, additionalInstructions } = req.body ?? {};

  if (!letterType || !LETTER_TYPES[letterType]) {
    res.status(400).json({ error: "Please select a valid letter type." }); return;
  }
  if (!context || typeof context !== "string" || context.trim().length < 20) {
    res.status(400).json({ error: "Please provide more context (at least a few sentences about your background)." }); return;
  }

  const { systemPrompt } = LETTER_TYPES[letterType];

  const userMessage = `Here is the context for this letter:\n\n${context.trim()}${wordCount ? `\n\nTarget word count: ${wordCount}` : ""}${additionalInstructions ? `\n\nAdditional instructions: ${additionalInstructions}` : ""}

Please write the letter now. Output only the letter itself — no preamble, no "Here is your letter:", no meta-commentary. Just the letter.`;

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Letter generation failed";
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.end();
  }
});

router.get("/letters/types", async (req, res): Promise<void> => {
  res.json(
    Object.entries(LETTER_TYPES).map(([key, val]) => ({ key, name: val.name }))
  );
});

export default router;
