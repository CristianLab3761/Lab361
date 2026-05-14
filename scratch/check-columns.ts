import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const sql = postgres(process.env.DATABASE_URL || '');

async function checkColumns() {
  console.log('--- Checking columns for RequisicionesV05 ---');
  try {
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'RequisicionesV05'
      ORDER BY ordinal_position
    `;
    console.log('Columns:');
    cols.forEach(c => console.log(`- "${c.column_name}" (${c.data_type})`));

  } catch (err: any) {
    console.error('SQL Error:', err.message);
  } finally {
    await sql.end();
  }
}

checkColumns();
