import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sectionsTable = pgTable("sections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: varchar("short_name", { length: 20 }).notNull(),
  color: varchar("color", { length: 20 }).notNull(),
  description: text("description").notNull(),
});

export const insertSectionSchema = createInsertSchema(sectionsTable).omit({ id: true });
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Section = typeof sectionsTable.$inferSelect;
