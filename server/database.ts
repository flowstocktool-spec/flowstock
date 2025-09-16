import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

// Use Replit's built-in PostgreSQL connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/replit';

const sql = postgres(connectionString, { 
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false
});

export const db = drizzle(sql);

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Check if tables exist first
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;

    if (!result[0].exists) {
      console.log('Running database migrations...');
      await migrate(db, { migrationsFolder: 'migrations' });
      console.log('Database migrations completed');
    } else {
      console.log('Database tables already exist');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    // Don't throw error, continue with app startup
  }
}