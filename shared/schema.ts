import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  senderEmail: text("sender_email").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  minimumQuantity: integer("minimum_quantity").notNull().default(10),
  currentStock: integer("current_stock").notNull().default(0),
  supplierId: varchar("supplier_id").notNull(),
  userId: varchar("user_id").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const stockReports = pgTable("stock_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  processed: boolean("processed").default(false),
  userId: varchar("user_id").notNull(),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  supplierId: varchar("supplier_id").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  userId: varchar("user_id").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  senderEmail: true,
  password: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  email: true,
  userId: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  sku: true,
  minimumQuantity: true,
  currentStock: true,
  supplierId: true,
  userId: true,
});

export const insertStockReportSchema = createInsertSchema(stockReports).pick({
  filename: true,
  userId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertStockReport = z.infer<typeof insertStockReportSchema>;
export type StockReport = typeof stockReports.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
