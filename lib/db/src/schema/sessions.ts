import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sectionsTable } from "./sections";

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").references(() => sectionsTable.id),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  durationMinutes: integer("duration_minutes"),
  cardsReviewed: integer("cards_reviewed").notNull().default(0),
  cardsCorrect: integer("cards_correct").notNull().default(0),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true, startedAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;
