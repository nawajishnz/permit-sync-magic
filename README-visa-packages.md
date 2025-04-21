# Visa Packages Integration Guide

This guide explains how to set up and use the visa packages feature in Permitsy.

## Database Setup

The visa packages feature requires a `visa_packages` table in your Supabase database. To create this table:

1. Run the migration script:

```bash
# Log into Supabase and run the migration SQL
psql -h <SUPABASE_HOST> -d postgres -U postgres -f supabase/migrations/20240523_create_visa_packages.sql
```

Alternatively, you can copy the SQL from the migration file and run it directly in the Supabase SQL editor.

## Seeding Visa Packages

To create sample visa packages for all countries in your database:

1. Make sure your environment variables are set up correctly in a `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Run the seed script:

```bash
npm run seed:visa-packages
```

This script will:
- Fetch all countries from your database
- Create a sample visa package for each country with randomized pricing
- Upsert the packages into the `visa_packages` table (using country_id to avoid duplicates)

## Table Structure

The `visa_packages` table has the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| country_id | uuid | Foreign key to countries table |
| name | text | Name of the package (defaults to "Visa Package") |
| government_fee | numeric | Government fee in USD |
| service_fee | numeric | Service fee in USD |
| processing_days | integer | Number of days for processing |
| total_price | numeric | Computed total price (government_fee + service_fee) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

## Integration with Country Details

The visa packages are automatically displayed on the country details page when available. The page shows:

1. A breakdown of government and service fees
2. Visual representation of fee distribution
3. Processing time estimate
4. Total price calculation

## Integration with Countries Listing

The countries listing page also displays visa package information:

1. Each country card shows the total price from its visa package (if available)
2. Processing time is displayed to help users quickly compare options
3. Loading indicators are shown while package data is being fetched

## Admin Interface

Visa packages can be managed through the VisaPackagesManager component in the admin interface:

1. Add new visa packages
2. Edit existing packages
3. Delete packages
4. View all packages in a sortable table

## API Queries

To fetch visa packages in your code:

```typescript
const { data: visaPackage } = await supabase
  .from('visa_packages')
  .select(`
    id,
    country_id,
    name,
    government_fee,
    service_fee,
    processing_days,
    total_price,
    created_at,
    updated_at,
    countries (
      id,
      name
    )
  `)
  .eq('country_id', countryId)
  .single();
``` 