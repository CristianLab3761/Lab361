import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findTables() {
  console.log('Trying to find tables via RPC or raw query...');
  
  // We can try to use the REST API to list all objects if possible
  // But usually we don't have access to schema tables via anon key unless RLS is off or specialized functions exist.
  
  // Let's try to query a known table with a variation
  const { data, error } = await supabase.from('Centros de Negocios').select('*');
  if (error) console.log('Centros de Negocios Error:', error.message);
  else console.log('Centros de Negocios Data:', data);

  const { data: data2, error: error2 } = await supabase.from('Centros De Negocios').select('*');
  if (error2) console.log('Centros De Negocios Error:', error2.message);
  else console.log('Centros De Negocios Data:', data2);
}

findTables();
