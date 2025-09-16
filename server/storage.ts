import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  type User, type InsertUser,
  type Supplier, type InsertSupplier,
  type Product, type InsertProduct,
  type StockReport, type InsertStockReport,
  type Alert,
  users, suppliers, products, stockReports, alerts
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Supplier methods
  getSupplier(id: string): Promise<Supplier | undefined>;
  getSuppliersByUserId(userId: string): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;

  // Product methods
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByUserId(userId: string): Promise<Product[]>;
  getProductsBySku(sku: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  updateProductStock(id: string, currentStock: number): Promise<Product | undefined>;

  // Stock report methods
  createStockReport(report: InsertStockReport): Promise<StockReport>;
  getStockReportsByUserId(userId: string): Promise<StockReport[]>;
  updateStockReportProcessed(id: string, processed: boolean): Promise<StockReport | undefined>;

  // Alert methods
  createAlert(productId: string, supplierId: string, userId: string): Promise<Alert>;
  getAlertsByUserId(userId: string): Promise<Alert[]>;
}

class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }

    const client = postgres(process.env.DATABASE_URL);
    this.db = drizzle(client);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await this.db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Supplier methods
  async getSupplier(id: string): Promise<Supplier | undefined> {
    const result = await this.db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    return result[0];
  }

  async getSuppliersByUserId(userId: string): Promise<Supplier[]> {
    return await this.db.select().from(suppliers).where(eq(suppliers.userId, userId));
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const result = await this.db.insert(suppliers).values(insertSupplier).returning();
    return result[0];
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | undefined> {
    const result = await this.db.update(suppliers).set(updates).where(eq(suppliers.id, id)).returning();
    return result[0];
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await this.db.delete(suppliers).where(eq(suppliers.id, id)).returning();
    return result.length > 0;
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    const result = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductsByUserId(userId: string): Promise<Product[]> {
    return await this.db.select().from(products).where(eq(products.userId, userId));
  }

  async getProductsBySku(sku: string): Promise<Product[]> {
    return await this.db.select().from(products).where(eq(products.sku, sku));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await this.db.insert(products).values({
      ...insertProduct,
      minimumQuantity: insertProduct.minimumQuantity || 10,
      currentStock: insertProduct.currentStock || 0,
    }).returning();
    return result[0];
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const result = await this.db.update(products).set({
      ...updates,
      lastUpdated: new Date()
    }).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async updateProductStock(id: string, currentStock: number): Promise<Product | undefined> {
    const result = await this.db.update(products).set({
      currentStock,
      lastUpdated: new Date()
    }).where(eq(products.id, id)).returning();
    return result[0];
  }

  // Stock report methods
  async createStockReport(insertReport: InsertStockReport): Promise<StockReport> {
    const result = await this.db.insert(stockReports).values(insertReport).returning();
    return result[0];
  }

  async getStockReportsByUserId(userId: string): Promise<StockReport[]> {
    return await this.db.select().from(stockReports)
      .where(eq(stockReports.userId, userId))
      .orderBy(stockReports.uploadedAt);
  }

  async updateStockReportProcessed(id: string, processed: boolean): Promise<StockReport | undefined> {
    const result = await this.db.update(stockReports).set({ processed }).where(eq(stockReports.id, id)).returning();
    return result[0];
  }

  // Alert methods
  async createAlert(productId: string, supplierId: string, userId: string): Promise<Alert> {
    const result = await this.db.insert(alerts).values({
      productId,
      supplierId,
      userId,
    }).returning();
    return result[0];
  }

  async getAlertsByUserId(userId: string): Promise<Alert[]> {
    return await this.db.select().from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(alerts.sentAt);
  }
}

export const storage = new PostgresStorage();