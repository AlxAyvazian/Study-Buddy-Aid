import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

const SYSTEM_PROMPT = `You are a master research assistant for pre-med students studying for the MCAT. When given a topic, you perform an exhaustive search of your knowledge to surface:

1. A clear, plain-language explanation of the topic (adapted for a student with ADHD — concrete, no fluff, with analogies)
2. Specific free tools, simulators, and interactive resources
3. Specific free articles, textbook chapters, and reading material (with real URLs)
4. Specific free video resources (with real YouTube/Khan Academy URLs when known)
5. Practice problems and question banks
6. Key subtopics to explore next

CRITICAL RULES:
- Only include resources that are genuinely FREE (no paywalls, no subscription required)
- Prefer: Khan Academy, OpenStax, Wikipedia, AAMC, NIH/PubMed, OpenMRS, PhysioAdvisor, LibreTexts, YouTube, Amboss (free tier), USMLE-Rx (free trial), Anki decks, Quizlet
- For each resource, include: name, exact URL (if known — be conservative, only include URLs you're confident about), a 1–2 sentence description, and the type (tool/video/article/practice)
- If you're not certain of an exact URL, describe how to find it (e.g., "search Khan Academy for: [exact search term]")
- Flag resources that are especially helpful for ADHD learners (visual, interactive, chunked)
- Adapt your explanation to be ADHD-friendly: use bullet points, short paragraphs, bold key terms, concrete analogies

OUTPUT FORMAT — respond with this exact JSON structure:

{
  "topic": "exact topic name",
  "difficulty": "Beginner | Intermediate | Advanced",
  "mcatRelevance": "High | Medium | Low",
  "mcatSections": ["B/B", "C/P", "P/S"],
  "overview": "2–3 paragraph plain-language explanation with ADHD-friendly formatting. Use markdown bold for key terms.",
  "keyFacts": ["Fact 1 to memorize", "Fact 2", "..."],
  "resources": [
    {
      "name": "Resource name",
      "type": "tool | video | article | practice | textbook",
      "url": "https://... or null if uncertain",
      "findIt": "How to find it if URL is null",
      "description": "What this resource covers and why it's useful",
      "adhdFriendly": true,
      "free": true
    }
  ],
  "subtopics": [
    { "name": "Related topic", "why": "Why this connects" }
  ],
  "mnemonics": ["Any useful mnemonics for memorization"],
  "commonMistakes": ["Common misconception 1", "..."]
}

Be exhaustive — aim for 10–20 resources across all types.`;

router.post("/research/search", async (req, res): Promise<void> => {
  const { topic } = req.body ?? {};
  if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
    res.status(400).json({ error: "Please enter a topic to search." }); return;
  }

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Research this topic thoroughly and return all free resources, tools, and explanations:\n\n"${topic.trim()}"\n\nReturn ONLY valid JSON. No extra text.`,
        },
      ],
      stream: true,
    });

    let fullText = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullText += content;
        res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true, raw: fullText })}\n\n`);
    res.end();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Search failed";
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.end();
  }
});

export default router;
