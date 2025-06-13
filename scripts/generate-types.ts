import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_TEST_URL;
const supabaseKey = process.env.VITE_SUPABASE_TEST_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    const { data: types, error } = await supabase
      .rpc('generate_typescript_types', {
        schema: 'public',
        config: JSON.stringify({
          typescript: true,
          schema: 'public',
          tables: ['auth.users', 'profiles', 'travel_preferences']
        })
      });

    if (error) throw error;

    if (types) {
      const databaseTypes = types[0];
      const typesPath = './src/types/database.types.ts';
      await Deno.writeTextFile(typesPath, databaseTypes);
      console.log(`Generated types written to ${typesPath}`);
    }
  } catch (error) {
    console.error('Error generating types:', error);
    process.exit(1);
  }
}

main();
