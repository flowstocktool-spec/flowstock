import { storage } from "./storage";

export async function testDatabase() {
  console.log("Testing database connection...");

  try {
    // Test basic database operations
    const testUser = await storage.createUser({
      username: `test_user_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      senderEmail: `sender${Date.now()}@example.com`,
      password: "test123",
    });

    console.log("✅ Database connection successful! Created test user:", testUser.id);

    // Test reading back
    const retrievedUser = await storage.getUser(testUser.id);
    console.log("✅ Can read from database:", !!retrievedUser);

    return true;
  } catch (error) {
    console.error("❌ Database test failed:", error);
    return false;
  }
}

export async function testDatabaseConnection() {
  return testDatabase();
}