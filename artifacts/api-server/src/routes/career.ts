import { Router } from "express";
import { db, careerHistoryTable, accommodationsTrackerTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// ── Career History ──────────────────────────────────────────────────────────

router.get("/career", async (req, res): Promise<void> => {
  try {
    const entries = await db.select().from(careerHistoryTable).orderBy(careerHistoryTable.createdAt);
    res.json(entries);
  } catch { res.status(500).json({ error: "Failed to load career history" }); }
});

router.post("/career", async (req, res): Promise<void> => {
  const { type, title, organization, location, startDate, endDate, current, description, hours, contact } = req.body ?? {};
  if (!title || !organization || !startDate) {
    res.status(400).json({ error: "Title, organization, and start date are required." }); return;
  }
  try {
    const [entry] = await db.insert(careerHistoryTable).values({
      type: type ?? "work", title, organization,
      location: location ?? null, startDate,
      endDate: endDate ?? null, current: Boolean(current),
      description: description ?? null,
      hours: hours ? Number(hours) : null,
      contact: contact ?? null,
    }).returning();
    res.json(entry);
  } catch { res.status(500).json({ error: "Failed to save entry" }); }
});

router.patch("/career/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { type, title, organization, location, startDate, endDate, current, description, hours, contact } = req.body ?? {};
  try {
    const [updated] = await db.update(careerHistoryTable).set({
      type, title, organization, location, startDate, endDate,
      current: Boolean(current), description,
      hours: hours ? Number(hours) : null, contact,
    }).where(eq(careerHistoryTable.id, id)).returning();
    res.json(updated);
  } catch { res.status(500).json({ error: "Failed to update entry" }); }
});

router.delete("/career/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(careerHistoryTable).where(eq(careerHistoryTable.id, id));
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Failed to delete entry" }); }
});

// ── Accommodation Tracker ───────────────────────────────────────────────────

router.get("/accommodations", async (req, res): Promise<void> => {
  try {
    const items = await db.select().from(accommodationsTrackerTable).orderBy(accommodationsTrackerTable.createdAt);
    res.json(items);
  } catch { res.status(500).json({ error: "Failed to load accommodations" }); }
});

router.post("/accommodations", async (req, res): Promise<void> => {
  const { type, label, approvedBy, approvedDate, expiresDate, notes, appliedTo } = req.body ?? {};
  if (!type || !label) { res.status(400).json({ error: "Type and label are required." }); return; }
  try {
    const [item] = await db.insert(accommodationsTrackerTable).values({
      type, label,
      approvedBy: approvedBy ?? null,
      approvedDate: approvedDate ?? null,
      expiresDate: expiresDate ?? null,
      notes: notes ?? null,
      appliedTo: Array.isArray(appliedTo) ? appliedTo : [],
    }).returning();
    res.json(item);
  } catch { res.status(500).json({ error: "Failed to save accommodation" }); }
});

router.patch("/accommodations/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { type, label, approvedBy, approvedDate, expiresDate, notes, appliedTo } = req.body ?? {};
  try {
    const [updated] = await db.update(accommodationsTrackerTable).set({
      type, label, approvedBy, approvedDate, expiresDate, notes,
      appliedTo: Array.isArray(appliedTo) ? appliedTo : [],
    }).where(eq(accommodationsTrackerTable.id, id)).returning();
    res.json(updated);
  } catch { res.status(500).json({ error: "Failed to update accommodation" }); }
});

router.delete("/accommodations/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(accommodationsTrackerTable).where(eq(accommodationsTrackerTable.id, id));
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Failed to delete accommodation" }); }
});

export default router;
