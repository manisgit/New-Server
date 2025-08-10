import { pgTable, text, serial, timestamp, varchar, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  serialNumber: text("serial_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  deviceModel: text("device_model").notNull(),
  faultDescription: text("fault_description").notNull(),
  serviceDate: text("service_date").notNull(),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: ["in_progress", "completed", "returned"] }).notNull().default("in_progress"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  returnedAt: timestamp("returned_at"),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  model: text("model").notNull(),
  product: text("product").notNull(),
  condition: text("condition", { enum: ["new", "used", "refurbished"] }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  count: integer("count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  serialNumber: true,
  createdAt: true,
  completedAt: true,
  returnedAt: true,
  status: true,
});

export const updateServiceSchema = createInsertSchema(services).pick({
  status: true,
}).extend({
  id: z.number(),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  count: true,
});

export const updateInventoryCountSchema = z.object({
  id: z.number(),
  operation: z.enum(["add", "subtract"]),
  amount: z.number().positive(),
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type UpdateService = z.infer<typeof updateServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type UpdateInventoryCount = z.infer<typeof updateInventoryCountSchema>;
export type Inventory = typeof inventory.$inferSelect;
