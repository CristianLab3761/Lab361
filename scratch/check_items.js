
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkItems() {
  const { data, error } = await supabase
    .from('RequisicionesV05')
    .select('Items_JSON')
    .limit(5);

  if (error) {
    console.error(error);
    return;
  }

  data.forEach((row, i) => {
    console.log(`Row ${i} items:`, JSON.stringify(row.Items_JSON, null, 2));
  });
}

checkItems();
