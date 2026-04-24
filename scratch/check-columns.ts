import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
  console.log('Fetching columns from RequisicionesV05...');
  const { data, error } = await supabase.from('RequisicionesV05').select('*').limit(1);
  if (error) {
    console.error('Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('Columns found:', Object.keys(data[0]));
    console.log('Full row:', JSON.stringify(data[0], null, 2));
  } else {
    console.log('Table is empty.');
  }
}

checkColumns();
