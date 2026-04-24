import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectTables() {
  console.log('--- Inspecting CentrosDeNegocios ---');
  const { data: bn, error: bnError } = await supabase.from('CentrosDeNegocios').select('*');
  if (bnError) console.error('BN Error:', bnError);
  else console.log('BN Data:', JSON.stringify(bn, null, 2));

  console.log('\n--- Inspecting centrosCostos ---');
  const { data: cc, error: ccError } = await supabase.from('centrosCostos').select('*').limit(5);
  if (ccError) console.error('CC (centrosCostos) Error:', ccError);
  else console.log('CC (centrosCostos) Data Sample:', JSON.stringify(cc, null, 2));

  console.log('\n--- Inspecting CentrosDeCostos ---');
  const { data: cc2, error: cc2Error } = await supabase.from('CentrosDeCostos').select('*').limit(5);
  if (cc2Error) console.error('CC (CentrosDeCostos) Error:', cc2Error);
  else console.log('CC (CentrosDeCostos) Data Sample:', JSON.stringify(cc2, null, 2));
}

inspectTables();
