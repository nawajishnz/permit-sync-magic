# Database Schema Fix for Visa Packages

This document provides instructions for fixing the database schema issues with the `visa_packages` table.

## The Issue

The application is showing errors like:

```
Could not find the 'government_fee' column of 'visa_packages' in the schema cache
```

This indicates that the database table either doesn't exist or has a different structure than what the application expects.

## Fix Options

### Option 1: Run the SQL Script from the Supabase Dashboard

1. **Log in to your Supabase Dashboard**
   - Go to [https://app.supabase.io](https://app.supabase.io)
   - Select your project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Create a new query

3. **Copy and Paste the Fix Script**
   - Copy the entire contents of `fix-database-schema.sql` from this directory
   - Paste it into the SQL Editor

4. **Execute the Script**
   - Click "Run" to execute the script
   - You should see output showing the table structure

5. **Verify the Changes**
   - Make sure the query output shows all the required columns:
     - id
     - country_id
     - name
     - government_fee
     - service_fee
     - processing_days
     - total_price
     - created_at
     - updated_at

### Option 2: Use the Automated Fix Tool (Requires Node.js)

1. **Run the Fix Database Script**
   ```
   npm run fix-db
   ```

2. **Follow the Instructions**
   - The script will output instructions for manually applying the fix
   - Copy the SQL script and run it in your Supabase SQL Editor

## Reset Mock Mode

After fixing the database schema, you'll need to clear the mock mode in your browser:

1. **Exit Mock Mode from the UI**
   - If you see an "Exit Mock Mode" button in the Visa Packages UI, click it

2. **OR Use the Reset Tool**
   - Open `src/tools/reset-mock-mode.html` in your browser
   - Click the "Reset Mock Mode" button

3. **Refresh the Application**
   - Go back to the application and refresh the page
   - Try adding a visa package

## What the Fix Does

The fix script does the following:

1. **Checks if the visa_packages table exists**
   - If not, it creates the table with all required columns

2. **For existing tables, checks for missing columns**
   - Adds any missing columns (government_fee, service_fee, etc.)
   - Sets up the computed total_price column

3. **Creates helper functions**
   - add_visa_package: For adding new packages
   - get_table_info: For diagnosing schema issues

## Troubleshooting

If you continue to experience issues after applying the fix:

1. **Check the Browser Console**
   - Open your browser's developer tools (F12)
   - Look for error messages in the Console tab

2. **Verify Database Access**
   - Make sure your application has proper access to the database
   - Check that the Supabase URL and anon key are correct in your .env file

3. **Clear Browser Cache and Storage**
   - In your browser's developer tools, go to Application > Storage
   - Clear localStorage and reload the page

4. **Check Row-Level Security (RLS) Policies**
   - Verify the RLS policies in Supabase allow for the necessary operations

## Need Further Help?

If you continue to experience issues after following these steps, please provide:

1. The exact error message from the browser console
2. The output from running the fix script
3. A screenshot of the visa_packages table structure from Supabase 