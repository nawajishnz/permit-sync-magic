-- Script to check and fix the visa_packages table schema

-- First check if the table exists
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'visa_packages'
    ) INTO table_exists;

    IF NOT table_exists THEN
        RAISE NOTICE 'Table visa_packages does not exist. Creating it...';
        
        -- Create the table if it doesn't exist
        CREATE TABLE visa_packages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            country_id UUID NOT NULL REFERENCES countries(id),
            name TEXT NOT NULL,
            government_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            service_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            processing_days INTEGER NOT NULL DEFAULT 15,
            total_price DECIMAL(10,2) GENERATED ALWAYS AS (government_fee + service_fee) STORED,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Add comments for documentation
        COMMENT ON TABLE visa_packages IS 'Stores visa package information including fees and processing time';
        COMMENT ON COLUMN visa_packages.government_fee IS 'Official government visa fee';
        COMMENT ON COLUMN visa_packages.service_fee IS 'Permitsy service fee';
        COMMENT ON COLUMN visa_packages.processing_days IS 'Number of working days for processing';
        COMMENT ON COLUMN visa_packages.total_price IS 'Total price (government fee + service fee)';

        -- Add unique constraint
        ALTER TABLE visa_packages ADD CONSTRAINT unique_country_package UNIQUE (country_id);

        -- Enable RLS
        ALTER TABLE visa_packages ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY "Enable read access for all users"
        ON visa_packages
        FOR SELECT
        USING (true);

        CREATE POLICY "Enable write access for authenticated users"
        ON visa_packages
        FOR INSERT
        TO authenticated
        WITH CHECK (true);

        CREATE POLICY "Enable update for authenticated users"
        ON visa_packages
        FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);

        CREATE POLICY "Enable delete for authenticated users"
        ON visa_packages
        FOR DELETE
        TO authenticated
        USING (true);

        -- Grant necessary permissions
        GRANT ALL ON visa_packages TO authenticated;
        GRANT SELECT ON visa_packages TO anon;
        
        RAISE NOTICE 'Table visa_packages created successfully!';
    ELSE
        RAISE NOTICE 'Table visa_packages already exists. Checking columns...';
        
        -- Check if the columns exist and add them if they don't
        DO $$
        DECLARE
            column_exists BOOLEAN;
        BEGIN
            -- Check government_fee column
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'visa_packages'
                AND column_name = 'government_fee'
            ) INTO column_exists;
            
            IF NOT column_exists THEN
                RAISE NOTICE 'Adding government_fee column...';
                ALTER TABLE visa_packages ADD COLUMN government_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00;
                COMMENT ON COLUMN visa_packages.government_fee IS 'Official government visa fee';
            END IF;
            
            -- Check service_fee column
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'visa_packages'
                AND column_name = 'service_fee'
            ) INTO column_exists;
            
            IF NOT column_exists THEN
                RAISE NOTICE 'Adding service_fee column...';
                ALTER TABLE visa_packages ADD COLUMN service_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00;
                COMMENT ON COLUMN visa_packages.service_fee IS 'Permitsy service fee';
            END IF;
            
            -- Check processing_days column
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'visa_packages'
                AND column_name = 'processing_days'
            ) INTO column_exists;
            
            IF NOT column_exists THEN
                RAISE NOTICE 'Adding processing_days column...';
                ALTER TABLE visa_packages ADD COLUMN processing_days INTEGER NOT NULL DEFAULT 15;
                COMMENT ON COLUMN visa_packages.processing_days IS 'Number of working days for processing';
            END IF;
            
            -- Check total_price column
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'visa_packages'
                AND column_name = 'total_price'
            ) INTO column_exists;
            
            IF NOT column_exists THEN
                RAISE NOTICE 'Adding total_price column...';
                -- First add the column without the generated always constraint
                ALTER TABLE visa_packages ADD COLUMN total_price DECIMAL(10,2);
                
                -- Then update it based on existing data
                UPDATE visa_packages SET total_price = government_fee + service_fee;
                
                -- Finally, drop and recreate as GENERATED ALWAYS
                ALTER TABLE visa_packages DROP COLUMN total_price;
                ALTER TABLE visa_packages ADD COLUMN total_price DECIMAL(10,2) 
                    GENERATED ALWAYS AS (government_fee + service_fee) STORED;
                
                COMMENT ON COLUMN visa_packages.total_price IS 'Total price (government fee + service fee)';
            END IF;
        END $$;
        
        RAISE NOTICE 'Schema check and update completed.';
    END IF;
END $$;

-- Recreate the add_visa_package function
CREATE OR REPLACE FUNCTION add_visa_package(
    p_country_id UUID,
    p_name TEXT DEFAULT 'Visa Package',
    p_government_fee DECIMAL DEFAULT 0,
    p_service_fee DECIMAL DEFAULT 0,
    p_processing_days INTEGER DEFAULT 15
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_id UUID;
    result JSON;
BEGIN
    -- Insert the new visa package
    INSERT INTO visa_packages(
        country_id,
        name,
        government_fee,
        service_fee,
        processing_days,
        created_at,
        updated_at
    )
    VALUES(
        p_country_id,
        p_name,
        p_government_fee,
        p_service_fee,
        p_processing_days,
        NOW(),
        NOW()
    )
    RETURNING id INTO new_id;
    
    -- Get the newly created package
    SELECT row_to_json(vp)
    INTO result
    FROM (
        SELECT v.*, c.name as country_name
        FROM visa_packages v
        JOIN countries c ON v.country_id = c.id
        WHERE v.id = new_id
    ) vp;
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_visa_package TO authenticated;

-- Create or replace the get_table_info function
CREATE OR REPLACE FUNCTION get_table_info(p_table_name TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(row_to_json(cols))
    INTO result
    FROM (
        SELECT 
            column_name, 
            data_type, 
            is_nullable
        FROM 
            information_schema.columns
        WHERE 
            table_name = p_table_name
            AND table_schema = 'public'
        ORDER BY 
            ordinal_position
    ) cols;
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_table_info TO authenticated;

-- Output table structure for verification
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'visa_packages'
    AND table_schema = 'public'
ORDER BY 
    ordinal_position; 