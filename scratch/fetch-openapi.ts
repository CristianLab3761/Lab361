import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function main() {
  const url = `${supabaseUrl}/rest/v1/`;
  console.log('Fetching OpenAPI spec from:', url);
  
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${await res.text()}`);
    }
    
    const schema = await res.json() as any;
    console.log('Successfully fetched OpenAPI schema!');
    
    const tables = Object.keys(schema.definitions || {});
    console.log('Tables defined in schema:', tables);
    
    for (const tableName of ['RequisicionesV05', 'RequisicionesV04', 'OrdenesCompraV05']) {
      const def = schema.definitions?.[tableName];
      if (def) {
        console.log(`\nColumns for table: ${tableName}`);
        const props = def.properties || {};
        Object.entries(props).forEach(([colName, details]: [string, any]) => {
          console.log(` - ${colName}: ${details.type} (${details.description || ''})`);
        });
      } else {
        console.log(`\nTable ${tableName} not found in definitions.`);
      }
    }
  } catch (error) {
    console.error('Error fetching schema:', error);
  }
}

main();
