import { Router } from "express";
import multer from "multer";
import { db, premedDocsTable, premedChecklistTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const DEFAULT_CHECKLIST = [
  { category: "Prerequisites", label: "Biology I & II", description: "One full year with lab", sortOrder: 1 },
  { category: "Prerequisites", label: "General Chemistry I & II", description: "One full year with lab", sortOrder: 2 },
  { category: "Prerequisites", label: "Organic Chemistry I & II", description: "One full year with lab", sortOrder: 3 },
  { category: "Prerequisites", label: "Physics I & II", description: "One full year with lab", sortOrder: 4 },
  { category: "Prerequisites", label: "Biochemistry", description: "One semester minimum", sortOrder: 5 },
  { category: "Prerequisites", label: "English / Writing", description: "One full year", sortOrder: 6 },
  { category: "Prerequisites", label: "Math / Statistics", description: "One semester of stats recommended", sortOrder: 7 },
  { category: "Prerequisites", label: "Psychology & Sociology", description: "Strongly recommended for MCAT", sortOrder: 8 },
  { category: "Exam", label: "MCAT registered or completed", description: "Score 510+ is competitive", sortOrder: 9 },
  { category: "Exam", label: "GPA above 3.5 overall", description: "Maintain strong cumulative GPA", sortOrder: 10 },
  { category: "Exam", label: "Science GPA above 3.4", description: "Biology, Chemistry, Physics GPA", sortOrder: 11 },
  { category: "Experience", label: "Clinical volunteering (100+ hrs)", description: "Patient contact in hospital or clinic", sortOrder: 12 },
  { category: "Experience", label: "Physician shadowing (40+ hrs)", description: "Shadow multiple specialties if possible", sortOrder: 13 },
  { category: "Experience", label: "Research experience", description: "Wet lab or clinical research", sortOrder: 14 },
  { category: "Experience", label: "Community service / volunteering", description: "Non-clinical service to community", sortOrder: 15 },
  { category: "Experience", label: "Leadership role", description: "Club, team, or organization leadership", sortOrder: 16 },
  { category: "Application", label: "Personal statement drafted", description: "Tell your authentic story", sortOrder: 17 },
  { category: "Application", label: "Letters of recommendation (3+)", description: "At least one from a science professor", sortOrder: 18 },
  { category: "Application", label: "AMCAS / AACOMAS primary submitted", description: "Submit as early as possible (June/July)", sortOrder: 19 },
  { category: "Application", label: "Secondary applications completed", description: "Respond within 2 weeks of receipt", sortOrder: 20 },
];

async function seedChecklist() {
  const existing = await db.select().from(premedChecklistTable).limit(1);
  if (existing.length === 0) {
    await db.insert(premedChecklistTable).values(DEFAULT_CHECKLIST);
  }
}

seedChecklist().catch(() => {});

router.get("/premed/checklist", async (req, res): Promise<void> => {
  try {
    const items = await db.select().from(premedChecklistTable).orderBy(premedChecklistTable.sortOrder);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: "Failed to load checklist" });
  }
});

router.patch("/premed/checklist/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const completed = Boolean(req.body?.completed);
  if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [updated] = await db
      .update(premedChecklistTable)
      .set({ completed, completedAt: completed ? new Date() : null })
      .where(eq(premedChecklistTable.id, id))
      .returning();
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: "Failed to update checklist item" });
  }
});

router.get("/premed/docs", async (req, res): Promise<void> => {
  try {
    const docs = await db
      .select({
        id: premedDocsTable.id,
        name: premedDocsTable.name,
        category: premedDocsTable.category,
        wordCount: premedDocsTable.wordCount,
        uploadedAt: premedDocsTable.uploadedAt,
        preview: premedDocsTable.content,
      })
      .from(premedDocsTable)
      .orderBy(premedDocsTable.uploadedAt);
    res.json(docs.map(d => ({ ...d, preview: d.preview.slice(0, 200) })));
  } catch (e) {
    res.status(500).json({ error: "Failed to load documents" });
  }
});

router.get("/premed/docs/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [doc] = await db.select().from(premedDocsTable).where(eq(premedDocsTable.id, id));
    if (!doc) { res.status(404).json({ error: "Not found" }); return; }
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: "Failed to load document" });
  }
});

router.post("/premed/docs/upload", upload.single("file"), async (req, res): Promise<void> => {
  try {
    let content = "";
    let name = req.body?.name || "Untitled document";
    const category = req.body?.category || "general";

    if (req.file) {
      name = req.file.originalname;
      content = req.file.buffer.toString("utf-8");
    } else if (typeof req.body?.text === "string" && req.body.text.trim()) {
      content = req.body.text.trim();
    } else {
      res.status(400).json({ error: "Provide a file or paste text." });
      return;
    }

    const wordCount = content.split(/\s+/).filter(Boolean).length;

    const [doc] = await db
      .insert(premedDocsTable)
      .values({ name, category, content, wordCount })
      .returning();

    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: "Upload failed" });
  }
});

router.delete("/premed/docs/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(premedDocsTable).where(eq(premedDocsTable.id, id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete document" });
  }
});

router.post("/premed/docs/:id/analyze", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [doc] = await db.select().from(premedDocsTable).where(eq(premedDocsTable.id, id));
    if (!doc) { res.status(404).json({ error: "Not found" }); return; }

    const text = doc.content.toLowerCase();
    const checklist = await db.select().from(premedChecklistTable).orderBy(premedChecklistTable.sortOrder);

    const suggestions: string[] = [];
    const autoMatched: number[] = [];

    const matchMap: Record<number, RegExp> = {};
    checklist.forEach(item => {
      const words = item.label.toLowerCase().replace(/[()&+]/g, "").split(/\s+/).filter(w => w.length > 3);
      if (words.length > 0) matchMap[item.id] = new RegExp(words.slice(0, 3).join("|"), "i");
    });

    for (const item of checklist) {
      if (!item.completed && matchMap[item.id] && matchMap[item.id].test(doc.content)) {
        autoMatched.push(item.id);
      }
    }

    const incomplete = checklist.filter(i => !i.completed && !autoMatched.includes(i.id));
    if (incomplete.length > 0) {
      suggestions.push(`You still have ${incomplete.length} unchecked requirement${incomplete.length > 1 ? "s" : ""}.`);
      const cats = [...new Set(incomplete.map(i => i.category))];
      cats.forEach(cat => {
        const items = incomplete.filter(i => i.category === cat);
        suggestions.push(`${cat}: ${items.map(i => i.label).join(", ")}.`);
      });
    }

    if (autoMatched.length > 0) {
      const names = checklist.filter(i => autoMatched.includes(i.id)).map(i => i.label);
      suggestions.push(`This document mentions: ${names.join(", ")} — consider marking those done.`);
    }

    const wordCount = doc.wordCount;
    if (wordCount > 500) suggestions.push("This is a detailed doc — consider making flashcards from key points.");
    if (/research|lab|study/.test(text)) suggestions.push("Looks like a research-related doc — make sure research experience is logged.");
    if (/shadow|shadowing/.test(text)) suggestions.push("Shadowing doc detected — log your hours if you haven't.");
    if (/volunteer|clinical/.test(text)) suggestions.push("Clinical or volunteer experience mentioned — great for your application.");

    if (suggestions.length === 0) suggestions.push("Everything looks on track! Keep building your application.");

    res.json({ suggestions, autoMatched });
  } catch (e) {
    res.status(500).json({ error: "Analysis failed" });
  }
});

export default router;
