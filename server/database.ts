
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import fs from "fs";
import path from "path";

export async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  try {
    // Check if tables exist by trying to query users table
    await client`SELECT 1 FROM users LIMIT 1`;
    console.log("Database tables already exist");
  } catch (error) {
    console.log("Database tables don't exist, running migrations...");
    
    // Read and execute migration
    const migrationPath = path.join(process.cwd(), 'migrations', '0001_initial.sql');
    if (fs.existsSync(migrationPath)) {
      const migration = fs.readFileSync(migrationPath, 'utf-8');
      await client.unsafe(migration);
      console.log("Database initialized successfully");
    } else {
      console.error("Migration file not found");
    }
  }

  await client.end();
}
