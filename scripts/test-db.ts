import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Fetching columns from Proveedores...');
  const { data, error } = await supabase.from('Proveedores').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else if (data && data.length > 0) {
    console.log('Columns found:', Object.keys(data[0]));
  } else {
    // Try to find columns via dummy insert error
    console.log('Table exists but is empty. Trying dummy insert to see columns...');
    const { error: dummyError } = await supabase.from('Proveedores').insert({ id: 'dummy-id-123-probing' });
    console.error('Probing error:', dummyError);
  }
}

test();
