# Fixing Row Level Security (RLS) in Supabase

The application is encountering the error: `"role \"admin\" does not exist"` because there's a misconfiguration in the Row Level Security policies on Supabase.

## Solution

1. Log in to your Supabase dashboard: https://app.supabase.com/
2. Select your project: `zewkainvgxtlmtuzgvjg`
3. Go to the SQL Editor (left sidebar)
4. Create a new query
5. Copy and paste the contents of the `src/utils/rls-fix.sql` file into the query editor
6. Run the query

This will:
- Remove any policies that might be using the non-existent "admin" role
- Create proper RLS policies using the "anon" role for public read access
- Set up appropriate permissions for authenticated users

## Alternative Solution

If you prefer not to run SQL, you can do this through the Supabase UI:

1. Go to the Table Editor in your Supabase dashboard
2. Select the "countries" table
3. Click on "Authentication" in the right sidebar
4. Delete any policies that mention "admin"
5. Add a new policy for "SELECT" with the following settings:
   - Policy name: "Allow public read access"
   - Target roles: (leave blank for all roles)
   - Using expression: `true`

6. Click "Save Policy"

## Verification

After applying either fix:
1. Restart your application
2. The "Error loading countries" message should no longer appear
3. The countries data should load successfully

## Technical Details

The error occurs because your Supabase RLS policy was referencing an "admin" role that doesn't exist in your project. The fix properly configures the RLS policies to work with the default "anon" (anonymous) role that all public requests use. 