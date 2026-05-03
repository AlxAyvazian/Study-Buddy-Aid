import { Router } from "express";

const router = Router();

router.post("/media/generate", async (req, res): Promise<void> => {
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  const type = req.body?.type === "video" ? "video" : "image";

  if (!prompt) {
    res.status(400).json({ error: "Please enter a prompt." });
    return;
  }

  if (type === "image") {
    res.json({
      type,
      title: "Generated image concept",
      description: `A calm, polished image idea for: ${prompt}`,
      prompt,
    });
    return;
  }

  const beats = prompt
    .split(/[.\n,]/)
    .map((part: string) => part.trim())
    .filter(Boolean)
    .slice(0, 5);

  res.json({
    type,
    title: "Video storyboard",
    description: `A simple storyboard for: ${prompt}`,
    scenes: (beats.length > 0 ? beats : [prompt]).map((beat: string, index: number) => ({
      scene: index + 1,
      shot: beat,
      duration: "3-5s",
    })),
  });
});

export default router;
