import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const email = `probe-${Math.floor(Math.random() * 100000)}@example.com`;
  const password = 'TestPassword123!';
  
  console.log('Attempting sign up with email:', email);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (authError) {
    console.error('Sign up error:', authError.message);
    return;
  }
  
  console.log('Sign up successful! User ID:', authData.user?.id);
  
  console.log('Fetching rows from RequisicionesV05...');
  const { data, error } = await supabase.from('RequisicionesV05').select('*').limit(5);
  
  if (error) {
    console.error('Fetch error:', error.message);
  } else {
    console.log('Fetch successful! Row count:', data?.length);
    if (data && data.length > 0) {
      console.log('Columns in RequisicionesV05:', Object.keys(data[0]));
      console.log('Sample row:', data[0]);
    } else {
      console.log('The table RequisicionesV05 is completely empty (no rows).');
    }
  }

  // Clean up user
  console.log('Cleaning up: signing out');
  await supabase.auth.signOut();
}

main();
