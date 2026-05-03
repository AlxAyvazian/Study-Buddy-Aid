import { Router } from "express";
import { db, sessionsTable, sectionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateSessionBody, UpdateSessionBody, UpdateSessionParams } from "@workspace/api-zod";

const router = Router();

function serializeSession(session: typeof sessionsTable.$inferSelect, sectionName?: string | null) {
  return {
    id: session.id,
    sectionId: session.sectionId,
    sectionName: sectionName ?? null,
    startedAt: session.startedAt.toISOString(),
    endedAt: session.endedAt?.toISOString() ?? null,
    durationMinutes: session.durationMinutes ?? null,
    cardsReviewed: session.cardsReviewed,
    cardsCorrect: session.cardsCorrect,
  };
}

router.get("/sessions", async (req, res): Promise<void> => {
  const rows = await db
    .select({ session: sessionsTable, sectionName: sectionsTable.name })
    .from(sessionsTable)
    .leftJoin(sectionsTable, eq(sessionsTable.sectionId, sectionsTable.id));

  res.json(rows.map(({ session, sectionName }) => serializeSession(session, sectionName)));
});

router.post("/sessions", async (req, res): Promise<void> => {
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [inserted] = await db
    .insert(sessionsTable)
    .values({ sectionId: parsed.data.sectionId ?? null })
    .returning();

  let sectionName: string | null = null;
  if (inserted.sectionId) {
    const [sec] = await db.select().from(sectionsTable).where(eq(sectionsTable.id, inserted.sectionId));
    sectionName = sec?.name ?? null;
  }
  res.status(201).json(serializeSession(inserted, sectionName));
});

router.put("/sessions/:id", async (req, res): Promise<void> => {
  const paramParsed = UpdateSessionParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateSessionBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }
  const b = bodyParsed.data;
  const updates: Record<string, unknown> = {};
  if (b.endedAt) updates.endedAt = new Date(b.endedAt);
  if (b.cardsReviewed !== undefined) updates.cardsReviewed = b.cardsReviewed;
  if (b.cardsCorrect !== undefined) updates.cardsCorrect = b.cardsCorrect;
  if (b.endedAt) {
    const start = await db.select().from(sessionsTable).where(eq(sessionsTable.id, paramParsed.data.id));
    if (start[0]) {
      const diffMs = new Date(b.endedAt).getTime() - start[0].startedAt.getTime();
      updates.durationMinutes = Math.round(diffMs / 60000);
    }
  }

  const [updated] = await db
    .update(sessionsTable)
    .set(updates)
    .where(eq(sessionsTable.id, paramParsed.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  let sectionName: string | null = null;
  if (updated.sectionId) {
    const [sec] = await db.select().from(sectionsTable).where(eq(sectionsTable.id, updated.sectionId));
    sectionName = sec?.name ?? null;
  }
  res.json(serializeSession(updated, sectionName));
});

export default router;
