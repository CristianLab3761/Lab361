import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
  console.log('Listing all tables in public schema...');
  // This is a bit tricky with just the JS client, but we can try to query a system table if we have permissions
  // or just try common names.
  
  const commonNames = [
    'CentrosDeNegocios', 'centros_negocios', 'centros-negocios',
    'centrosCostos', 'CentrosDeCostos', 'centros_costos', 'centros-costos',
    'Proveedores', 'Solicitudes', 'Requisiciones', 'RequisicionesV05'
  ];

  for (const name of commonNames) {
    const { data, error } = await supabase.from(name).select('*').limit(1);
    if (!error) {
      console.log(`Table found: ${name} (Has data: ${data.length > 0})`);
    } else if (error.code !== 'PGRST204' && error.code !== 'PGRST205') {
       // PGRST204: not found (sometimes), PGRST205: not found
       console.log(`Table check error for ${name}:`, error.message);
    }
  }
}

listTables();
