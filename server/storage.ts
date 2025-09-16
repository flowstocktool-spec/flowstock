import {
  type User, type InsertUser,
  type Supplier, type InsertSupplier,
  type Product, type InsertProduct,
  type StockReport, type InsertStockReport,
  type Alert
} from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private suppliers: Map<string, Supplier>;
  private products: Map<string, Product>;
  private stockReports: Map<string, StockReport>;
  private alerts: Map<string, Alert>;

  constructor() {
    this.users = new Map();
    this.suppliers = new Map();
    this.products = new Map();
    this.stockReports = new Map();
    this.alerts = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Supplier methods
  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async getSuppliersByUserId(userId: string): Promise<Supplier[]> {
    return Array.from(this.suppliers.values()).filter(
      (supplier) => supplier.userId === userId,
    );
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplier: Supplier = { ...insertSupplier, id, createdAt: new Date() };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;
    
    const updatedSupplier = { ...supplier, ...updates };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    return this.suppliers.delete(id);
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByUserId(userId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.userId === userId,
    );
  }

  async getProductsBySku(sku: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.sku === sku,
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      minimumQuantity: insertProduct.minimumQuantity || 10,
      currentStock: insertProduct.currentStock || 0,
      lastUpdated: new Date()
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates, lastUpdated: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async updateProductStock(id: string, currentStock: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, currentStock, lastUpdated: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  // Stock report methods
  async createStockReport(insertReport: InsertStockReport): Promise<StockReport> {
    const id = randomUUID();
    const report: StockReport = {
      ...insertReport,
      id,
      uploadedAt: new Date(),
      processed: false,
    };
    this.stockReports.set(id, report);
    return report;
  }

  async getStockReportsByUserId(userId: string): Promise<StockReport[]> {
    return Array.from(this.stockReports.values())
      .filter((report) => report.userId === userId)
      .sort((a, b) => (b.uploadedAt?.getTime() || 0) - (a.uploadedAt?.getTime() || 0));
  }

  async updateStockReportProcessed(id: string, processed: boolean): Promise<StockReport | undefined> {
    const report = this.stockReports.get(id);
    if (!report) return undefined;
    
    const updatedReport = { ...report, processed };
    this.stockReports.set(id, updatedReport);
    return updatedReport;
  }

  // Alert methods
  async createAlert(productId: string, supplierId: string, userId: string): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = {
      id,
      productId,
      supplierId,
      userId,
      sentAt: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async getAlertsByUserId(userId: string): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter((alert) => alert.userId === userId)
      .sort((a, b) => (b.sentAt?.getTime() || 0) - (a.sentAt?.getTime() || 0));
  }
}

export const storage = new MemStorage();
