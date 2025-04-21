// Script to seed visa packages into the database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and key are required!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedVisaPackages() {
  try {
    console.log('Fetching countries...');
    
    // Get all countries
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('id, name');
    
    if (countriesError) {
      console.error('Error fetching countries:', countriesError);
      return;
    }
    
    if (!countries.length) {
      console.error('No countries found in the database.');
      return;
    }
    
    console.log(`Found ${countries.length} countries. Creating visa packages...`);
    
    // Create visa packages for each country
    const packages = countries.map(country => {
      // Generate realistic but randomized package details
      const governmentFee = parseFloat((Math.random() * 100 + 50).toFixed(2));
      const serviceFee = parseFloat((Math.random() * 70 + 30).toFixed(2));
      const processingDays = Math.floor(Math.random() * 20 + 5);
      
      return {
        country_id: country.id,
        name: `${country.name} Tourist Visa`,
        government_fee: governmentFee,
        service_fee: serviceFee,
        processing_days: processingDays,
        total_price: parseFloat((governmentFee + serviceFee).toFixed(2)),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    // Insert packages into the database - upsert to handle existing records
    const { data, error } = await supabase
      .from('visa_packages')
      .upsert(packages, { onConflict: 'country_id' })
      .select();
    
    if (error) {
      console.error('Error creating visa packages:', error);
      return;
    }
    
    console.log(`Successfully created ${data.length} visa packages!`);
    
    // Print a few examples
    console.log('\nExample packages:');
    data.slice(0, 3).forEach(pkg => {
      console.log(`- ${pkg.name}: $${pkg.total_price} (Processing: ${pkg.processing_days} days)`);
    });
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the seeding function
seedVisaPackages()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  }); 