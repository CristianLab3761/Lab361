import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase
    .from('ListaDeMateriales')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error checking columns:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns in ListaDeMateriales:', Object.keys(data[0]));
  } else {
    console.log('ListaDeMateriales is empty.');
  }
}

checkColumns();
