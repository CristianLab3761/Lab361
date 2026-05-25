import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function probeColumn(colName: string) {
  const payload: any = {
    'REQUISICIÓN': 'PROBE-COL-V4',
    'Solicitante': 'Probe'
  };
  payload[colName] = '2026-05-25';

  const { error } = await supabase.from('RequisicionesV04').insert([payload]);
  
  if (error) {
    if (error.message.includes('does not exist')) {
      console.log(`Column [${colName}] -> DOES NOT EXIST`);
    } else {
      console.log(`Column [${colName}] -> EXISTS (Error returned: ${error.message})`);
    }
  } else {
    console.log(`Column [${colName}] -> EXISTS (Success)`);
    await supabase.from('RequisicionesV04').delete().eq('REQUISICIÓN', 'PROBE-COL-V4');
  }
}

async function main() {
  const candidates = [
    'Fecha Entrega',
    'fecha_entrega',
    'Fecha_Entrega',
    'fechaEntrega',
    'entrega',
    'fecha_entrega_estimada',
    'Fecha de entrega'
  ];

  for (const col of candidates) {
    await probeColumn(col);
  }
}

main();
