import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function probeColumnNames() {
  console.log('Probing centrosCostos column names...');
  
  // Try to insert an object with just 'name' to see if it works and what else it returns
  const { data, error } = await supabase.from('centrosCostos').insert({ name: 'probe-name' }).select();
  
  if (error) {
    console.log('Insert Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('Row inserted successfully. Columns:', Object.keys(data[0]));
    // Clean up
    await supabase.from('centrosCostos').delete().eq('name', 'probe-name');
  } else {
     console.log('No data returned, let try to fetch a dummy error by using an invalid column');
     const { error: invalidError } = await supabase.from('centrosCostos').select('nosuchcolumn');
     console.log('Invalid Column Error:', invalidError?.message);
  }
}

probeColumnNames();
