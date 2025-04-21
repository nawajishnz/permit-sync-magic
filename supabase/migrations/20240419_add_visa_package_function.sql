-- Create a function to add visa packages that bypasses schema caching issues
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

-- Create a function to get table columns
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