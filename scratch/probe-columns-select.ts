import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function probeColumnNames() {
  console.log('Probing centrosCostos column names via SELECT error messages...');
  
  const commonNames = ['code', 'codigo', 'ceco', 'Ceco', 'CODIGO', 'key'];

  for (const name of commonNames) {
    const { error } = await supabase.from('centrosCostos').select(name).limit(1);
    if (!error) {
      console.log(`Column '${name}' EXISTS!`);
    } else if (error.code === '42703' || error.message.includes('not exist')) {
      console.log(`Column '${name}' does NOT exist.`);
    } else {
      console.log(`Column '${name}' check error:`, error.message);
    }
  }
}

probeColumnNames();
