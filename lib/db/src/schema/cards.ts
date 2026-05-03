import { pgTable, serial, integer, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sectionsTable } from "./sections";

export const cardsTable = pgTable("cards", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").notNull().references(() => sectionsTable.id),
  front: text("front").notNull(),
  back: text("back").notNull(),
  difficulty: varchar("difficulty", { length: 10 }).notNull().default("medium"),
  status: varchar("status", { length: 10 }).notNull().default("new"),
  hasVisualAid: boolean("has_visual_aid").notNull().default(false),
  visualAidType: varchar("visual_aid_type", { length: 20 }),
  visualAidContent: text("visual_aid_content"),
  reviewCount: integer("review_count").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
});

export const insertCardSchema = createInsertSchema(cardsTable).omit({ id: true, createdAt: true });
export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cardsTable.$inferSelect;
