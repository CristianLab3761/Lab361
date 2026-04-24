import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function probeSchema() {
  console.log('Probing centrosCostos schema...');
  // Insert a dummy object with many keys to see what matches
  const { error } = await supabase.from('centrosCostos').insert({ 
    id: '00000000-0000-0000-0000-000000000000',
    name: 'probe',
    code: 'probe',
    area: 'probe',
    centro_negocios_id: '00000000-0000-0000-0000-000000000000',
    business_unit: 'probe'
  });
  
  if (error) {
    console.log('Error (this is expected):', error.message);
  }
}

probeSchema();
