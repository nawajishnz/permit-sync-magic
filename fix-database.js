const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = "https://zewkainvgxtlmtuzgvjg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpld2thaW52Z3h0bG10dXpndmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzY4MDMsImV4cCI6MjA1ODc1MjgwM30.j0-qB84p-aYyXDdGX0ycfqL9hIGnOwizDvNpfZOkHQ4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function waitFor(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDbFix() {
  try {
    console.log('Checking Supabase connection...');
    
    // Check if the database is accessible
    const { data, error } = await supabase.from('countries').select('count');
    
    if (error) {
      console.log('Error accessing countries table, will try to fix. Error:', error);
    } else {
      console.log('Countries table accessible, count:', data[0]?.count);
    }
    
    // Read the SQL fix file
    const sqlCommands = fs.readFileSync('./src/utils/rls-fix.sql', 'utf8');
    console.log('Loaded SQL commands');
    
    // Try to run the SQL fix
    try {
      console.log('Creating countries table and fixing permissions...');
      const { data: result, error: sqlError } = await supabase.rpc('exec_sql', { 
        sql_query: sqlCommands 
      });
      
      if (sqlError) {
        console.error('SQL execution error:', sqlError);
        console.log('Trying another approach...');
        
        // Try individual statements instead
        const statements = sqlCommands.split(';').filter(stmt => stmt.trim());
        
        for (let i = 0; i < statements.length; i++) {
          const stmt = statements[i].trim();
          if (!stmt) continue;
          
          console.log(`Executing statement ${i+1}/${statements.length}...`);
          try {
            const { error } = await supabase.rpc('exec_sql', { sql_query: stmt + ';' });
            if (error) {
              console.warn(`Statement ${i+1} error:`, error);
            } else {
              console.log(`Statement ${i+1} executed successfully`);
            }
            // Wait a bit between statements
            await waitFor(500);
          } catch (err) {
            console.error(`Statement ${i+1} exception:`, err);
          }
        }
      } else {
        console.log('SQL executed successfully:', result);
      }
    } catch (err) {
      console.error('SQL execution exception:', err);
      
      // Try direct data insertion instead (last resort)
      console.log('Attempting direct data insertion...');
      
      const { error: insertError } = await supabase
        .from('countries')
        .insert([
          {
            name: 'United States',
            flag: 'https://www.countryflagicons.com/FLAT/64/US.png',
            banner: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=1200&h=600&q=80',
            description: 'The United States is a diverse country with attractions ranging from the skyscrapers of New York and Chicago, to the natural wonders of Yellowstone and Alaska, to the warm beaches of Florida and Hawaii.',
            entry_type: 'Visa Required',
            validity: '10 years',
            processing_time: '3-5 business days',
            length_of_stay: 'Up to 180 days per entry'
          }
        ]);
        
      if (insertError) {
        console.error('Direct insertion error:', insertError);
      } else {
        console.log('Direct insertion successful');
      }
    }
    
    // Final check
    console.log('Checking countries table again...');
    const { data: finalCheck, error: finalError } = await supabase.from('countries').select('count');
    
    if (finalError) {
      console.error('Still cannot access countries table:', finalError);
    } else {
      console.log('Fix successful, countries count:', finalCheck[0]?.count);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

runDbFix(); 