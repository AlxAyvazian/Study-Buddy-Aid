import { pgTable, serial, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const premedDocsTable = pgTable("premed_docs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: varchar("category", { length: 50 }).notNull().default("general"),
  content: text("content").notNull(),
  wordCount: integer("word_count").notNull().default(0),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPremedDocSchema = createInsertSchema(premedDocsTable).omit({ id: true, uploadedAt: true });
export type InsertPremedDoc = z.infer<typeof insertPremedDocSchema>;
export type PremedDoc = typeof premedDocsTable.$inferSelect;

export const premedChecklistTable = pgTable("premed_checklist", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  label: text("label").notNull(),
  description: text("description"),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertPremedChecklistSchema = createInsertSchema(premedChecklistTable).omit({ id: true });
export type InsertPremedChecklist = z.infer<typeof insertPremedChecklistSchema>;
export type PremedChecklist = typeof premedChecklistTable.$inferSelect;
