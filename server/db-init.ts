
import { storage } from "./storage";
import bcrypt from "bcryptjs";

export async function initializeDatabase() {
  try {
    console.log("🗃️  Testing database connection...");
    
    // Test basic database connectivity
    const testUser = await storage.getUserById("non-existent-id");
    
    console.log("✅ Database connection verified");
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    return false;
  }
}

export async function createSampleData() {
  try {
    console.log("🌱 Creating sample data...");

    // Check if sample data already exists
    const existingUsers = await storage.getUser("sample-user-check");
    if (existingUsers) {
      console.log("ℹ️  Sample data already exists, skipping creation");
      return;
    }

    // Create a sample user with properly hashed password
    const hashedPassword = await bcrypt.hash("demo123", 10);
    const user = await storage.createUser({
      username: "demo_user",
      email: "demo@stockalert.com",
      senderEmail: "demo@stockalert.com",
      password: hashedPassword,
    });

    // Create multiple suppliers
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

    // Create sample products with different stock levels
    const product1 = await storage.createProduct({
      name: "Wireless Mouse",
      sku: "MOUSE-001",
      minimumQuantity: 20,
      currentStock: 5, // Low stock - will trigger alert
      supplierId: supplier1.id,
      userId: user.id,
    });

    const product2 = await storage.createProduct({
      name: "USB Cable",
      sku: "USB-C-001",
      minimumQuantity: 50,
      currentStock: 75, // Good stock level
      supplierId: supplier1.id,
      userId: user.id,
    });

    const product3 = await storage.createProduct({
      name: "Bluetooth Speaker",
      sku: "SPEAKER-001",
      minimumQuantity: 10,
      currentStock: 2, // Critical low stock
      supplierId: supplier2.id,
      userId: user.id,
    });

    console.log("✅ Sample data created successfully!");
    console.log("📊 Demo Account Details:");
    console.log("   Username: demo_user");
    console.log("   Password: demo123");
    console.log("   Email: demo@stockalert.com");
    console.log("");
    console.log("🏢 Created Suppliers:");
    console.log(`   - ${supplier1.name} (${supplier1.email})`);
    console.log(`   - ${supplier2.name} (${supplier2.email})`);
    console.log("");
    console.log("📦 Created Products:");
    console.log(`   - ${product1.name} (${product1.sku}) - ⚠️  LOW STOCK: ${product1.currentStock}/${product1.minimumQuantity}`);
    console.log(`   - ${product2.name} (${product2.sku}) - ✅ Good stock: ${product2.currentStock}/${product2.minimumQuantity}`);
    console.log(`   - ${product3.name} (${product3.sku}) - 🚨 CRITICAL: ${product3.currentStock}/${product3.minimumQuantity}`);
    
    return { user, suppliers: [supplier1, supplier2], products: [product1, product2, product3] };
  } catch (error) {
    console.error("❌ Failed to create sample data:", error);
    throw error;
  }
}
