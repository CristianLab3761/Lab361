import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Checking Requisiciones...');
  const { data, error } = await supabase.from('Requisiciones').select('*').limit(1);
  if (error) {
    console.error('Requisiciones error:', error);
  } else {
    console.log('Requisiciones rows:', data?.length);
    if (data && data.length > 0) {
      console.log('Requisiciones sample:', data[0]);
    }
  }
}

test();
