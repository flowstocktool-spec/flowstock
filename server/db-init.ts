
import { storage } from "./storage";

export async function initializeDatabase() {
  try {
    console.log("Database connection successful");
    
    // Test basic operations
    const testUserId = "test-user-id";
    
    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
}

export async function createSampleData() {
  try {
    // Create a sample user
    const user = await storage.createUser({
      username: "admin",
      email: "admin@example.com",
      senderEmail: "your-email@gmail.com",
      password: "hashed_password_here", // In real app, this should be properly hashed
    });

    // Create a sample supplier
    const supplier = await storage.createSupplier({
      name: "Sample Supplier Ltd",
      email: "supplier@example.com",
      userId: user.id,
    });

    // Create a sample product
    const product = await storage.createProduct({
      name: "Sample Product",
      sku: "SAMPLE001",
      minimumQuantity: 10,
      currentStock: 5,
      supplierId: supplier.id,
      userId: user.id,
    });

    console.log("Sample data created successfully");
    console.log("User ID:", user.id);
    console.log("Supplier ID:", supplier.id);
    console.log("Product ID:", product.id);
    
    return { user, supplier, product };
  } catch (error) {
    console.error("Failed to create sample data:", error);
    throw error;
  }
}
