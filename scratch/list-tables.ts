import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const sql = postgres(process.env.DATABASE_URL || '');

async function listTables() {
  console.log('--- Listing all tables in public schema ---');
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('Tables found:');
    tables.forEach(t => console.log(`- ${t.table_name}`));

  } catch (err: any) {
    console.error('SQL Error:', err.message);
  } finally {
    await sql.end();
  }
}

listTables();
