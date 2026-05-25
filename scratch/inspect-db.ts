import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL || '');

async function main() {
  try {
    console.log('Querying table names...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables found:', tables.map(t => t.table_name));

    for (const tableName of ['RequisicionesV05', 'RequisicionesV04']) {
      console.log(`\nInspecting columns for table: ${tableName}`);
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ${tableName}
      `;
      columns.forEach(c => {
        console.log(` - ${c.column_name}: ${c.data_type}`);
      });
    }
  } catch (error) {
    console.error('Error connecting to DB:', error);
  } finally {
    await sql.end();
  }
}

main();
