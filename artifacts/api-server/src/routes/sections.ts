import { Router } from "express";
import { db, sectionsTable, cardsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

router.get("/sections", async (req, res): Promise<void> => {
  const sections = await db.select().from(sectionsTable);
  const cardCounts = await db
    .select({
      sectionId: cardsTable.sectionId,
      total: count(),
      mastered: count(
        eq(cardsTable.status, "mastered") ? cardsTable.id : null
      ),
    })
    .from(cardsTable)
    .groupBy(cardsTable.sectionId);

  // Get mastered counts separately
  const masteredCounts = await db
    .select({ sectionId: cardsTable.sectionId, cnt: count() })
    .from(cardsTable)
    .where(eq(cardsTable.status, "mastered"))
    .groupBy(cardsTable.sectionId);

  const totalMap = new Map(cardCounts.map((r) => [r.sectionId, Number(r.total)]));
  const masteredMap = new Map(masteredCounts.map((r) => [r.sectionId, Number(r.cnt)]));

  const result = sections.map((s) => ({
    id: s.id,
    name: s.name,
    shortName: s.shortName,
    color: s.color,
    description: s.description,
    totalCards: totalMap.get(s.id) ?? 0,
    masteredCards: masteredMap.get(s.id) ?? 0,
  }));

  res.json(result);
});

export default router;
