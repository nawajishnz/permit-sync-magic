-- Check the current structure of the visa_packages table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns 
WHERE 
    table_name = 'visa_packages'
ORDER BY 
    ordinal_position;

-- Check if the table exists at all
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'visa_packages'
);

-- Check if any data exists in the table
SELECT COUNT(*) FROM visa_packages;

-- List all functions related to visa packages
SELECT 
    routine_name 
FROM 
    information_schema.routines
WHERE 
    routine_name LIKE '%visa%' OR 
    routine_name LIKE '%package%'; 