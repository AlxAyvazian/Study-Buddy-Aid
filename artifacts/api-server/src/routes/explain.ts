import { Router } from "express";

const router = Router();

router.post("/explain", async (req, res): Promise<void> => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text) {
    res.status(400).json({ error: "Please upload or paste some text." });
    return;
  }

  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const bullets = lines.slice(0, 6).map((line, i) => `${i + 1}. ${line}`);

  res.json({
    title: "Simple explanation",
    summary: `I found ${lines.length} idea${lines.length === 1 ? "" : "s"}.`,
    explanation: bullets.length > 0 ? bullets.join("\n") : text,
    tips: ["Read it once slowly.", "Circle words you do not know.", "Turn each line into one small question."],
  });
});

export default router;
