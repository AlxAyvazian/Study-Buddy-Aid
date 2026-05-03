import { Router } from "express";

const router = Router();

const schools = [
  {
    name: "Typical MD school",
    requirements: ["Biology 1/2", "General Chemistry 1/2", "Organic Chemistry 1/2", "Physics 1/2", "Biochemistry", "English/Writing"],
  },
  {
    name: "Typical DO school",
    requirements: ["Biology 1/2", "General Chemistry 1/2", "Organic Chemistry 1/2", "Physics 1/2", "Biochemistry", "English/Writing", "Psychology/Sociology"],
  },
  {
    name: "Research-heavy school",
    requirements: ["Research experience", "Strong GPA", "MCAT", "Shadowing", "Clinical volunteering", "Letters of recommendation"],
  },
];

router.post("/premed/track", async (req, res): Promise<void> => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text) {
    res.status(400).json({ error: "Please paste your activities, classes, or target school notes." });
    return;
  }

  const lower = text.toLowerCase();
  const signals = {
    gpa: /gpa|grade point/.test(lower),
    mcat: /mcat/.test(lower),
    shadowing: /shadow/.test(lower),
    clinical: /clinical|patient|hospital|volunteer/.test(lower),
    research: /research|lab/.test(lower),
    service: /service|community/.test(lower),
    letters: /letter|lor|recommendation/.test(lower),
    prereqs: /biology|chemistry|organic|physics|biochemistry|english|writing/.test(lower),
  };

  const missing = Object.entries(signals)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  const done = Object.entries(signals)
    .filter(([, value]) => value)
    .map(([key]) => key);

  res.json({
    summary: `I found ${done.length} covered areas and ${missing.length} gaps.`,
    done,
    missing,
    schools,
    advice: [
      "Keep a simple spreadsheet with columns for each requirement.",
      "Track hours, dates, and contact people for shadowing and volunteering.",
      "Turn missing prerequisites into your next action list.",
    ],
  });
});

export default router;
