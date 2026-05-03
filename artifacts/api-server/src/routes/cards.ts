import { Router } from "express";
import { db, cardsTable, sectionsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  ListCardsQueryParams,
  CreateCardBody,
  UpdateCardBody,
  ReviewCardBody,
  GetCardParams,
  UpdateCardParams,
  DeleteCardParams,
  ReviewCardParams,
} from "@workspace/api-zod";

const router = Router();

async function getCardWithSection(id: number) {
  const rows = await db
    .select({
      card: cardsTable,
      sectionName: sectionsTable.name,
    })
    .from(cardsTable)
    .innerJoin(sectionsTable, eq(cardsTable.sectionId, sectionsTable.id))
    .where(eq(cardsTable.id, id));
  if (!rows[0]) return null;
  const { card, sectionName } = rows[0];
  return {
    ...card,
    sectionName,
    visualAidType: card.visualAidType ?? null,
    visualAidContent: card.visualAidContent ?? null,
    lastReviewedAt: card.lastReviewedAt?.toISOString() ?? null,
    createdAt: card.createdAt.toISOString(),
  };
}

router.get("/cards", async (req, res): Promise<void> => {
  const parsed = ListCardsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { sectionId, difficulty, status } = parsed.data;

  const conditions = [];
  if (sectionId !== undefined) conditions.push(eq(cardsTable.sectionId, sectionId));
  if (difficulty) conditions.push(eq(cardsTable.difficulty, difficulty));
  if (status) conditions.push(eq(cardsTable.status, status));

  const rows = await db
    .select({ card: cardsTable, sectionName: sectionsTable.name })
    .from(cardsTable)
    .innerJoin(sectionsTable, eq(cardsTable.sectionId, sectionsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const result = rows.map(({ card, sectionName }) => ({
    ...card,
    sectionName,
    visualAidType: card.visualAidType ?? null,
    visualAidContent: card.visualAidContent ?? null,
    lastReviewedAt: card.lastReviewedAt?.toISOString() ?? null,
    createdAt: card.createdAt.toISOString(),
  }));
  res.json(result);
});

router.post("/cards", async (req, res): Promise<void> => {
  const parsed = CreateCardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { sectionId, front, back, difficulty, hasVisualAid, visualAidType, visualAidContent } = parsed.data;
  const [inserted] = await db
    .insert(cardsTable)
    .values({
      sectionId,
      front,
      back,
      difficulty: difficulty ?? "medium",
      hasVisualAid: hasVisualAid ?? false,
      visualAidType: visualAidType ?? null,
      visualAidContent: visualAidContent ?? null,
    })
    .returning();
  const card = await getCardWithSection(inserted.id);
  res.status(201).json(card);
});

router.get("/cards/:id", async (req, res): Promise<void> => {
  const parsed = GetCardParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const card = await getCardWithSection(parsed.data.id);
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  res.json(card);
});

router.put("/cards/:id", async (req, res): Promise<void> => {
  const paramParsed = UpdateCardParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateCardBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  const b = bodyParsed.data;
  if (b.front !== undefined) updates.front = b.front;
  if (b.back !== undefined) updates.back = b.back;
  if (b.difficulty !== undefined) updates.difficulty = b.difficulty;
  if (b.hasVisualAid !== undefined) updates.hasVisualAid = b.hasVisualAid;
  if (b.visualAidType !== undefined) updates.visualAidType = b.visualAidType;
  if (b.visualAidContent !== undefined) updates.visualAidContent = b.visualAidContent;

  await db.update(cardsTable).set(updates).where(eq(cardsTable.id, paramParsed.data.id));
  const card = await getCardWithSection(paramParsed.data.id);
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  res.json(card);
});

router.delete("/cards/:id", async (req, res): Promise<void> => {
  const parsed = DeleteCardParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(cardsTable).where(eq(cardsTable.id, parsed.data.id));
  res.status(204).send();
});

router.post("/cards/:id/review", async (req, res): Promise<void> => {
  const paramParsed = ReviewCardParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = ReviewCardBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }
  const { known } = bodyParsed.data;
  const id = paramParsed.data.id;

  // Fetch current values first
  const [current] = await db.select().from(cardsTable).where(eq(cardsTable.id, id));
  if (!current) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  const newReviewCount = current.reviewCount + 1;
  const newCorrectCount = current.correctCount + (known ? 1 : 0);

  // Determine new status based on performance
  let newStatus = current.status;
  const ratio = newCorrectCount / newReviewCount;
  if (newReviewCount >= 3 && ratio >= 0.8) {
    newStatus = "mastered";
  } else if (newReviewCount >= 1) {
    newStatus = "learning";
  }

  await db
    .update(cardsTable)
    .set({
      reviewCount: newReviewCount,
      correctCount: newCorrectCount,
      status: newStatus,
      lastReviewedAt: new Date(),
    })
    .where(eq(cardsTable.id, id));

  const card = await getCardWithSection(id);
  res.json(card);
});

export default router;
