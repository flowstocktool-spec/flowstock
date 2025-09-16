
import { storage } from "./storage";

export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test creating a user
    const testUser = await storage.createUser({
      username: `test_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      senderEmail: 'test@gmail.com',
      password: 'test123'
    });
    
    console.log('✅ Database connection successful! Created test user:', testUser.id);
    
    // Clean up
    const users = await storage.getUserById(testUser.id);
    console.log('✅ Can read from database:', !!users);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
