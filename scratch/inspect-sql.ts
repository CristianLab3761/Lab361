import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const sql = postgres(process.env.DATABASE_URL || '');

async function inspectWithSQL() {
  console.log('--- Inspecting with direct SQL ---');
  try {
    const bn = await sql`SELECT * FROM "CentrosDeNegocios"`;
    console.log('CentrosDeNegocios:', JSON.stringify(bn, null, 2));

    const cc = await sql`SELECT * FROM "centrosCostos" LIMIT 5`;
    console.log('centrosCostos:', JSON.stringify(cc, null, 2));
    
    // Check table structure
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'centrosCostos'
    `;
    console.log('centrosCostos columns:', JSON.stringify(cols, null, 2));

  } catch (err: any) {
    console.error('SQL Error:', err.message);
  } finally {
    await sql.end();
  }
}

inspectWithSQL();
