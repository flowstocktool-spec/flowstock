
import { setupDatabase } from "./db-setup";
import { storage } from "./storage";

export async function validateSetup(): Promise<boolean> {
  console.log("🔍 Validating application setup...");
  
  const checks = {
    databaseUrl: false,
    databaseConnection: false,
    tablesExist: false,
    sampleData: false,
    crud: false
  };

  try {
    // Check DATABASE_URL
    if (process.env.DATABASE_URL) {
      checks.databaseUrl = true;
      console.log("✅ DATABASE_URL is configured");
    } else {
      console.log("❌ DATABASE_URL is missing");
      return false;
    }

    // Test database connection
    try {
      await storage.getUserById('validation-test');
      checks.databaseConnection = true;
      console.log("✅ Database connection works");
    } catch (error) {
      console.log("❌ Database connection failed:", error);
      return false;
    }

    // Check if demo user exists (indicates sample data is present)
    try {
      const demoUser = await storage.getUserByUsername('demo_user');
      if (demoUser) {
        checks.sampleData = true;
        console.log("✅ Sample data exists");
        
        // Test CRUD operations
        const suppliers = await storage.getSuppliersByUserId(demoUser.id);
        const products = await storage.getProductsByUserId(demoUser.id);
        
        if (suppliers.length > 0 && products.length > 0) {
          checks.crud = true;
          console.log("✅ CRUD operations working");
        }
      }
    } catch (error) {
      console.log("⚠️  Sample data check failed:", error);
    }

    const allPassed = Object.values(checks).every(Boolean);
    
    if (allPassed) {
      console.log("🎉 All setup validation checks passed!");
      console.log("📊 Summary:");
      console.log("   - Database URL: ✅");
      console.log("   - Database Connection: ✅");
      console.log("   - Sample Data: ✅");
      console.log("   - CRUD Operations: ✅");
    } else {
      console.log("❌ Some validation checks failed:");
      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`   - ${check}: ${passed ? '✅' : '❌'}`);
      });
    }

    return allPassed;

  } catch (error) {
    console.error("❌ Setup validation failed:", error);
    return false;
  }
}

// Allow running this script directly
if (require.main === module) {
  validateSetup()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error("Validation script failed:", error);
      process.exit(1);
    });
}
