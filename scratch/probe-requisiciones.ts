import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function probeRequisicionesSchema() {
  console.log('Probing RequisicionesV05 column names...');
  
  // Try to select one row to see all column names
  const { data, error } = await supabase.from('RequisicionesV05').select('*').limit(1);
  
  if (error) {
    console.log('Select Error:', error.message);
    // If select * fails or table empty, try to find columns via dummy error
    const { error: dummyError } = await supabase.from('RequisicionesV05').select('nosuchcolumn');
    console.log('Dummy Error:', dummyError?.message);
  } else if (data && data.length > 0) {
    console.log('Columns in RequisicionesV05:', Object.keys(data[0]));
  } else {
    console.log('Table is empty. Trying to guess columns...');
    const commonVariations = ['Fecha Estatus', 'Fecha_Estatus', 'fecha_estatus', 'fechaEstatus'];
    for (const v of commonVariations) {
      const { error: vError } = await supabase.from('RequisicionesV05').select(v).limit(1);
      if (!vError) console.log(`Column '${v}' EXISTS!`);
      else if (vError.code === '42703') console.log(`Column '${v}' does NOT exist.`);
      else console.log(`Column '${v}' check error:`, vError.message);
    }
  }
}

probeRequisicionesSchema();
