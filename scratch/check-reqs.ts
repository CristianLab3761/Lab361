import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRequisiciones() {
  console.log('Fetching last 5 requisitions from RequisicionesV05...');
  const { data, error } = await supabase.from('RequisicionesV05').select('*').order('created_at', { ascending: false }).limit(5);
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Requisitions found:', JSON.stringify(data, null, 2));
  }
}

checkRequisiciones();
