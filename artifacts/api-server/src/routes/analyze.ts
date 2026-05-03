import { Router } from "express";

const router = Router();

const MUST_MEMORIZE = [
  "High-yield formulas, definitions, and mechanisms",
  "Repeated concepts across multiple chapters",
  "Items that directly map to common MCAT question styles",
  "Anything your notes emphasize in bold, tables, or summary boxes",
];

const LIKELY_SKIP = [
  "Long anecdotes or repetitive story examples",
  "Overly detailed historical/background paragraphs",
  "Low-yield trivia that does not connect to exam concepts",
  "Passages with lots of words but only one small idea",
];

router.post("/analyze", async (req, res): Promise<void> => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text) {
    res.status(400).json({ error: "Please paste or upload some text first." });
    return;
  }

  const chunks = text
    .split(/\n{2,}|\.|\?|!|;/)
    .map((chunk: string) => chunk.trim())
    .filter(Boolean);

  const totalWords = text.split(/\s+/).filter(Boolean).length;
  const highYield = chunks.slice(0, 8).map((chunk: string) => `• ${chunk}`);
  const skip = chunks.slice(8, 16).map((chunk: string) => `• ${chunk}`);

  res.json({
    summary: `I found about ${chunks.length} concepts across ${totalWords} words.`,
    memorize: MUST_MEMORIZE,
    skip: skip.length > 0 ? skip : LIKELY_SKIP,
    highYieldNotes: highYield.length > 0 ? highYield : MUST_MEMORIZE,
    advice: [
      "Turn memorize items into flashcards.",
      "Skip long paragraphs unless they repeat a core idea.",
      "Use the rest only if it helps you answer practice questions.",
    ],
  });
});

export default router;
