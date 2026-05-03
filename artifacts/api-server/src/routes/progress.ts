import { Router } from "express";
import { db, cardsTable, sessionsTable, sectionsTable } from "@workspace/db";
import { eq, gte, count, sql } from "drizzle-orm";

const router = Router();

router.get("/progress", async (req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalResult] = await db.select({ cnt: count() }).from(cardsTable);
  const [masteredResult] = await db.select({ cnt: count() }).from(cardsTable).where(eq(cardsTable.status, "mastered"));
  const [learningResult] = await db.select({ cnt: count() }).from(cardsTable).where(eq(cardsTable.status, "learning"));
  const [newResult] = await db.select({ cnt: count() }).from(cardsTable).where(eq(cardsTable.status, "new"));

  const todaySessions = await db.select().from(sessionsTable).where(gte(sessionsTable.startedAt, today));
  const totalSessionsToday = todaySessions.length;
  const totalMinutesToday = todaySessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);

  // Weekly minutes (last 7 days)
  const weeklyMinutes: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const daySessions = await db
      .select({ durationMinutes: sessionsTable.durationMinutes })
      .from(sessionsTable)
      .where(
        sql`${sessionsTable.startedAt} >= ${dayStart} AND ${sessionsTable.startedAt} < ${dayEnd}`
      );
    weeklyMinutes.push(daySessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0));
  }

  // Section breakdown
  const sections = await db.select().from(sectionsTable);
  const allCards = await db.select({ sectionId: cardsTable.sectionId, status: cardsTable.status }).from(cardsTable);

  const sectionBreakdown = sections.map((s) => {
    const sCards = allCards.filter((c) => c.sectionId === s.id);
    const total = sCards.length;
    const mastered = sCards.filter((c) => c.status === "mastered").length;
    return {
      sectionId: s.id,
      sectionName: s.name,
      color: s.color,
      totalCards: total,
      masteredCards: mastered,
      percentage: total > 0 ? Math.round((mastered / total) * 100) : 0,
    };
  });

  res.json({
    totalCards: Number(totalResult.cnt),
    masteredCards: Number(masteredResult.cnt),
    learningCards: Number(learningResult.cnt),
    newCards: Number(newResult.cnt),
    totalSessionsToday,
    totalMinutesToday,
    weeklyMinutes,
    sectionBreakdown,
  });
});

router.get("/progress/streak", async (req, res): Promise<void> => {
  const allSessions = await db
    .select({ startedAt: sessionsTable.startedAt })
    .from(sessionsTable)
    .orderBy(sessionsTable.startedAt);

  const studiedDays = new Set<string>();
  for (const s of allSessions) {
    const d = s.startedAt.toISOString().split("T")[0];
    studiedDays.add(d);
  }

  const sortedDays = Array.from(studiedDays).sort();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Current streak
  let currentStreak = 0;
  let checkDate = studiedDays.has(today) ? today : yesterday;
  while (studiedDays.has(checkDate)) {
    currentStreak++;
    const prev = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split("T")[0];
    checkDate = prev;
  }

  // Longest streak
  let longestStreak = 0;
  let streak = 0;
  let prevDay: string | null = null;
  for (const day of sortedDays) {
    if (prevDay) {
      const diff = (new Date(day).getTime() - new Date(prevDay).getTime()) / 86400000;
      if (diff === 1) {
        streak++;
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }
    if (streak > longestStreak) longestStreak = streak;
    prevDay = day;
  }

  res.json({
    currentStreak,
    longestStreak,
    lastStudiedDate: sortedDays[sortedDays.length - 1] ?? null,
    studiedDates: sortedDays,
  });
});

export default router;
