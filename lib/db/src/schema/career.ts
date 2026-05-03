import { pgTable, serial, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const careerHistoryTable = pgTable("career_history", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 30 }).notNull().default("work"), // work, volunteer, research, shadowing, leadership, award
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  location: text("location"),
  startDate: varchar("start_date", { length: 20 }).notNull(),
  endDate: varchar("end_date", { length: 20 }),
  current: boolean("current").notNull().default(false),
  description: text("description"),
  hours: integer("hours"),
  contact: text("contact"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCareerHistorySchema = createInsertSchema(careerHistoryTable).omit({ id: true, createdAt: true });
export type InsertCareerHistory = z.infer<typeof insertCareerHistorySchema>;
export type CareerHistory = typeof careerHistoryTable.$inferSelect;

export const accommodationsTrackerTable = pgTable("accommodations_tracker", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // mcat, coursework, clinical, licensing
  label: text("label").notNull(),
  approvedBy: text("approved_by"),
  approvedDate: varchar("approved_date", { length: 20 }),
  expiresDate: varchar("expires_date", { length: 20 }),
  notes: text("notes"),
  appliedTo: text("applied_to").array(), // list of schools/exams it's been applied to
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAccommodationsTrackerSchema = createInsertSchema(accommodationsTrackerTable).omit({ id: true, createdAt: true });
export type InsertAccommodationsTracker = z.infer<typeof insertAccommodationsTrackerSchema>;
export type AccommodationsTracker = typeof accommodationsTrackerTable.$inferSelect;
