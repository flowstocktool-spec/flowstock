
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { storage } from "./storage";

export class DatabaseSetup {
  private sql: postgres.Sql;
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }

    this.sql = postgres(process.env.DATABASE_URL, { 
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false
    });
    this.db = drizzle(this.sql);
  }

  async initialize(): Promise<boolean> {
    try {
      console.log("🚀 Starting comprehensive database setup...");
      
      // Step 1: Test connection
      await this.testConnection();
      
      // Step 2: Run migrations
      await this.runMigrations();
      
      // Step 3: Verify tables exist
      await this.verifyTables();
      
      // Step 4: Create indexes if needed
      await this.ensureIndexes();
      
      // Step 5: Create sample data if needed
      await this.createSampleDataIfNeeded();
      
      console.log("✅ Database setup completed successfully!");
      return true;
    } catch (error) {
      console.error("❌ Database setup failed:", error);
      throw error;
    }
  }

  private async testConnection(): Promise<void> {
    console.log("🔌 Testing database connection...");
    
    try {
      const result = await this.sql`SELECT 1 as test`;
      if (result[0]?.test === 1) {
        console.log("✅ Database connection successful");
      } else {
        throw new Error("Connection test failed");
      }
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      throw new Error(`Database connection failed: ${error}`);
    }
  }

  private async runMigrations(): Promise<void> {
    console.log("📊 Running database migrations...");
    
    try {
      await migrate(this.db, { migrationsFolder: './migrations' });
      console.log("✅ Migrations completed successfully");
    } catch (error) {
      console.error("❌ Migration failed:", error);
      // Try to continue with manual table creation
      await this.createTablesManually();
    }
  }

  private async createTablesManually(): Promise<void> {
    console.log("🔧 Creating tables manually...");
    
    const createTables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        sender_email TEXT NOT NULL,
        password TEXT NOT NULL,
        gmail_username TEXT,
        gmail_app_password TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      // Suppliers table
      `CREATE TABLE IF NOT EXISTS suppliers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        user_id VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      // Products table
      `CREATE TABLE IF NOT EXISTS products (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        sku TEXT NOT NULL,
        minimum_quantity INTEGER NOT NULL DEFAULT 10,
        current_stock INTEGER NOT NULL DEFAULT 0,
        supplier_id VARCHAR NOT NULL,
        user_id VARCHAR NOT NULL,
        last_updated TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      // Stock reports table
      `CREATE TABLE IF NOT EXISTS stock_reports (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        filename TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT NOW(),
        processed BOOLEAN DEFAULT FALSE,
        user_id VARCHAR NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      // Alerts table
      `CREATE TABLE IF NOT EXISTS alerts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id VARCHAR NOT NULL,
        supplier_id VARCHAR NOT NULL,
        user_id VARCHAR NOT NULL,
        sent_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    ];

    for (const query of createTables) {
      try {
        await this.sql.unsafe(query);
      } catch (error) {
        console.error(`Failed to create table: ${error}`);
        throw error;
      }
    }
    
    console.log("✅ Tables created manually");
  }

  private async verifyTables(): Promise<void> {
    console.log("🔍 Verifying database tables...");
    
    const requiredTables = ['users', 'suppliers', 'products', 'stock_reports', 'alerts'];
    
    for (const tableName of requiredTables) {
      const result = await this.sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        )
      `;
      
      if (!result[0]?.exists) {
        throw new Error(`Required table '${tableName}' does not exist`);
      }
    }
    
    console.log("✅ All required tables verified");
  }

  private async ensureIndexes(): Promise<void> {
    console.log("📑 Creating database indexes...");
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id)',
      'CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)',
      'CREATE INDEX IF NOT EXISTS idx_products_stock_level ON products(current_stock, minimum_quantity)',
      'CREATE INDEX IF NOT EXISTS idx_stock_reports_user_id ON stock_reports(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_alerts_product_id ON alerts(product_id)',
      'CREATE INDEX IF NOT EXISTS idx_alerts_sent_at ON alerts(sent_at)'
    ];

    for (const indexQuery of indexes) {
      try {
        await this.sql.unsafe(indexQuery);
      } catch (error) {
        console.warn(`Warning: Index creation failed: ${error}`);
        // Continue with other indexes
      }
    }
    
    console.log("✅ Database indexes created");
  }

  private async createSampleDataIfNeeded(): Promise<void> {
    try {
      console.log("🌱 Checking for sample data...");

      // Check if demo user exists
      const existingUser = await storage.getUserByUsername('demo_user');
      if (existingUser) {
        console.log("ℹ️  Sample data already exists");
        return;
      }

      console.log("🌱 Creating sample data...");

      // Create demo user
      const hashedPassword = await bcrypt.hash("demo123", 10);
      const user = await storage.createUser({
        username: "demo_user",
        email: "demo@stockalert.com",
        senderEmail: "demo@stockalert.com",
        password: hashedPassword,
      });

      // Create suppliers
      const supplier1 = await storage.createSupplier({
        name: "TechParts Supplier",
        email: "orders@techparts.com",
        userId: user.id,
      });

      const supplier2 = await storage.createSupplier({
        name: "GlobalGoods Ltd",
        email: "supply@globalgoods.com", 
        userId: user.id,
      });

      const supplier3 = await storage.createSupplier({
        name: "Electronics Direct",
        email: "wholesale@electronicsdirect.com", 
        userId: user.id,
      });

      // Create products with varied stock levels
      const products = [
        {
          name: "Wireless Mouse",
          sku: "MOUSE-001",
          minimumQuantity: 20,
          currentStock: 5, // Low stock
          supplierId: supplier1.id,
          userId: user.id,
        },
        {
          name: "USB Cable",
          sku: "USB-C-001",
          minimumQuantity: 50,
          currentStock: 75, // Good stock
          supplierId: supplier1.id,
          userId: user.id,
        },
        {
          name: "Bluetooth Speaker",
          sku: "SPEAKER-001",
          minimumQuantity: 10,
          currentStock: 2, // Critical stock
          supplierId: supplier2.id,
          userId: user.id,
        },
        {
          name: "Mechanical Keyboard",
          sku: "KEYBOARD-001",
          minimumQuantity: 15,
          currentStock: 25, // Good stock
          supplierId: supplier3.id,
          userId: user.id,
        }
      ];

      for (const productData of products) {
        await storage.createProduct(productData);
      }

      console.log("✅ Sample data created successfully!");
      console.log("📊 Demo Account: username=demo_user, password=demo123");
      
    } catch (error) {
      console.error("❌ Failed to create sample data:", error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.sql.end();
      console.log("🧹 Database connections closed");
    } catch (error) {
      console.error("Warning: Failed to close database connections:", error);
    }
  }
}

export async function setupDatabase(): Promise<boolean> {
  const setup = new DatabaseSetup();
  try {
    return await setup.initialize();
  } finally {
    await setup.cleanup();
  }
}
