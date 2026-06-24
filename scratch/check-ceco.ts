import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCeco() {
  const { data, error } = await supabase.from('CECO').insert([{ CECO: 'TEST_CECO_FROM_SCRIPT' }]).select();
  console.log('CECO data:', data);
  console.log('CECO error:', error);
}

checkCeco();
