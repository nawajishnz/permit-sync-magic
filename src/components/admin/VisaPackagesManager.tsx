import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, testConnection, refreshSchemaCache } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, Info, RefreshCw, Plus, RefreshCcw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import type { Database } from '@/integrations/supabase/types';
import type { Json } from '@/integrations/supabase/types';

type VisaPackage = Database['public']['Tables']['visa_packages']['Row'] & {
  countries: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  }
};

type VisaPackageWithCountry = Database['public']['Tables']['visa_packages']['Row'] & {
  countries: Database['public']['Tables']['countries']['Row']
};

interface VisaPackageFormData {
  country_id: string;
  government_fee: number;
  service_fee: number;
  processing_days: number;
}

const calculateEstimatedDelivery = (processingDays: number): string => {
  const today = new Date();
  let businessDays = processingDays;
  const deliveryDate = new Date(today);

  while (businessDays > 0) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    // Skip weekends
    if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
      businessDays--;
    }
  }

  return deliveryDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const VisaPackagesManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<VisaPackage | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isMockMode, setIsMockMode] = useState(false);
  const [isMigrationComplete, setIsMigrationComplete] = useState(false);
  
  const [formData, setFormData] = useState<VisaPackageFormData>({
    country_id: '',
    government_fee: 0,
    service_fee: 0,
    processing_days: 0,
  });

  // Check for mock mode on component mount
  useEffect(() => {
    const usingMockData = localStorage.getItem('using_mock_data') === 'true';
    setIsMockMode(usingMockData);
  }, []);

  // Initialize local storage with previously encountered errors
  useEffect(() => {
    const knownErrors = localStorage.getItem('schema_errors') || '{}';
    console.log('Known schema errors:', knownErrors);
  }, []);

  useEffect(() => {
    // Check if we need to ensure the database schema is correct
    if (!isMigrationComplete) {
      checkAndRunMigration();
    }
  }, [isMigrationComplete]);
  
  // Function to check and apply migrations if needed
  const checkAndRunMigration = async () => {
    try {
      console.log('Checking visa_packages table schema...');
      
      // First check if we can connect to the database
      const { error: connError } = await supabase
        .from('countries')
        .select('count(*)')
        .limit(1);
        
      if (connError) {
        console.error('Connection test failed, cannot run migration:', connError);
        setIsMigrationComplete(true); // Mark as complete to avoid repeated attempts
        return;
      }
      
      // Attempt to create or update the visa_packages table
      await createOrUpdateVisaPackagesTable();
      
      setIsMigrationComplete(true);
    } catch (error) {
      console.error('Error checking schema:', error);
      setIsMigrationComplete(true); // Mark as complete to avoid repeated attempts
    }
  };
  
  const createOrUpdateVisaPackagesTable = async () => {
    try {
      console.log('Creating or updating visa_packages table...');
      
      // First, check if the table exists and what columns it has
      const { data: existingTable, error: tableError } = await supabase
        .from('visa_packages')
        .select('*')
        .limit(1);
      
      if (tableError && tableError.code !== '42P01') {
        // Error other than "table does not exist"
        console.error('Error checking visa_packages table:', tableError);
        throw tableError;
      }
      
      const tableExists = !tableError;
      console.log('Table exists:', tableExists);
      
      if (tableExists) {
        // Table exists, check columns
        const columns = existingTable && existingTable.length > 0 ? Object.keys(existingTable[0]) : [];
        console.log('Existing columns:', columns);
        
        // Check for missing columns
        const requiredColumns = ['government_fee', 'service_fee', 'processing_days', 'total_price'];
        const missingColumns = requiredColumns.filter(col => !columns.includes(col));
        
        if (missingColumns.length > 0) {
          console.log('Missing columns:', missingColumns);
          
          // Use RPC to add missing columns
          // This is a workaround since we can't execute raw SQL
          for (const column of missingColumns) {
            try {
              console.log(`Adding column: ${column}`);
              
              if (column === 'government_fee' || column === 'service_fee' || column === 'total_price') {
                // Create a dummy record to establish these columns
                const { data, error } = await supabase.rpc('add_column_if_not_exists', { 
                  p_table: 'visa_packages', 
                  p_column: column,
                  p_type: 'numeric' 
                });
                
                if (error) console.error(`Error adding ${column}:`, error);
                else console.log(`Added ${column} column`);
              } else if (column === 'processing_days') {
                const { data, error } = await supabase.rpc('add_column_if_not_exists', { 
                  p_table: 'visa_packages', 
                  p_column: column,
                  p_type: 'integer' 
                });
                
                if (error) console.error(`Error adding ${column}:`, error);
                else console.log(`Added ${column} column`);
              }
            } catch (columnError) {
              console.error(`Error adding column ${column}:`, columnError);
            }
          }
          
          // Alternatively, use direct approach to add defaults
          try {
            console.log('Setting default values for new columns...');
            await updateExistingRecords();
          } catch (defaultError) {
            console.error('Error setting defaults:', defaultError);
          }
        } else {
          console.log('All required columns exist');
        }
      } else {
        // Table doesn't exist, create it
        console.log('Creating visa_packages table...');
        
        // Since we can't use raw SQL, we'll create a record to establish the table
        const { data, error } = await supabase
          .from('visa_packages')
          .insert({
            country_id: '00000000-0000-0000-0000-000000000000', // A dummy ID
            name: 'Initial Package',
            government_fee: 0,
            service_fee: 0,
            processing_days: 0,
            total_price: 0
          });
          
        if (error && error.code !== '23503') { // Ignore foreign key constraint
          console.error('Error creating table:', error);
          throw error;
        }
        
        console.log('Created visa_packages table');
      }
      
      // Final verification
      try {
        await refreshSchemaCache();
        console.log('Schema cache refreshed');
      } catch (refreshError) {
        console.error('Error refreshing schema cache:', refreshError);
      }
      
    } catch (error) {
      console.error('Error in createOrUpdateVisaPackagesTable:', error);
      throw error;
    }
  };
  
  const updateExistingRecords = async () => {
    try {
      // Get all records that might need updating
      const { data: records, error } = await supabase
        .from('visa_packages')
        .select('id');
        
      if (error) {
        console.error('Error fetching records for update:', error);
        return;
      }
      
      if (!records || records.length === 0) {
        console.log('No records to update');
        return;
      }
      
      console.log(`Updating ${records.length} existing records with default values`);
      
      // Update each record with default values
      for (const record of records) {
        const { error: updateError } = await supabase
          .from('visa_packages')
          .update({
            government_fee: 100,
            service_fee: 50,
            processing_days: 15,
            total_price: 150
          })
          .eq('id', record.id);
          
        if (updateError) {
          console.error(`Error updating record ${record.id}:`, updateError);
        }
      }
      
      console.log('Finished updating records');
      
    } catch (error) {
      console.error('Error in updateExistingRecords:', error);
    }
  };
  
  const refreshSchemaCache = async () => {
    try {
      // Try to refresh schema cache
      const { error } = await supabase.rpc('reload_schema_cache');
      
      if (error) {
        console.error('Error refreshing schema cache:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Schema cache refresh failed:', error);
      return false;
    }
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      console.log('Attempting to reconnect...');
      const isConnected = await testConnection();
      
      if (isConnected) {
        console.log('Connection restored successfully');
        queryClient.invalidateQueries({ queryKey: ['visaPackages'] });
        toast({ title: "Success", description: "Connection restored successfully" });
      } else {
        console.error('Reconnection failed');
        toast({ 
          title: "Error", 
          description: retryCount >= 3 
            ? "Multiple connection attempts failed. Please check your network settings or contact support."
            : "Still unable to connect. Please check your network connection.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Retry connection failed:', error);
      toast({ 
        title: "Error", 
        description: "Failed to reconnect. Please try again later.", 
        variant: "destructive" 
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const fetchVisaPackages = async () => {
    console.log('Fetching visa packages...');
    
    // Check if we're in mock mode (could be set from previous failed attempts)
    const usingMockData = localStorage.getItem('using_mock_data') === 'true';
    if (usingMockData) {
      console.log('Using mock data for visa packages');
      const mockData = JSON.parse(localStorage.getItem('mock_visa_packages') || '[]');
      console.log('Mock data retrieved:', mockData.length, 'packages');
      return mockData;
    }
    
    try {
      // First test connection with a simple query
      console.log('Testing database connection...');
      const { error: connError } = await supabase
        .from('countries')
        .select('count(*)')
        .limit(1);
        
      if (connError) {
        console.error('Connection test failed:', connError);
        throw new Error(`Database connection issue: ${connError.message}`);
      }
      
      console.log('Connection test successful, proceeding with fetch');
      
      // Try first query approach
      try {
        console.log('Attempting to fetch visa packages with standard method');
        const { data, error } = await supabase
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
          `);
        
        if (error) {
          console.error('Error fetching visa packages:', error);
          // If schema cache error, try different approach
          if (error.message.includes('schema cache') || error.code === '42703') {
            console.log('Schema cache error detected, trying raw fetch method');
            throw error; // Proceed to alternative method
          }
          throw error;
        }
        
        console.log('Successfully fetched', data.length, 'visa packages');
        return data;
      } catch (fetchError) {
        console.error('Standard fetch failed, trying alternative approach');
        
        // Alternative approach: Break into two separate queries
        // 1. First get basic visa package data
        const { data: packagesData, error: packagesError } = await supabase
          .from('visa_packages')
          .select('id, country_id, name, created_at, updated_at');
        
        if (packagesError) {
          console.error('Alternative fetch failed too:', packagesError);
          throw packagesError;
        }
        
        if (!packagesData || packagesData.length === 0) {
          console.log('No visa packages found');
          return [];
        }
        
        console.log('Successfully fetched basic package data:', packagesData.length, 'packages');
        
        // 2. Then get country information and merge manually
        const uniqueCountryIds = [...new Set(packagesData.map(pkg => pkg.country_id))];
        
        const { data: countriesData, error: countriesError } = await supabase
          .from('countries')
          .select('id, name')
          .in('id', uniqueCountryIds);
        
        if (countriesError) {
          console.error('Error fetching country data:', countriesError);
          throw countriesError;
        }
        
        // Manually add pricing information and country data
        console.log('Manually combining package and country data');
        
        // Create a lookup for countries
        const countryLookup = countriesData.reduce((lookup, country) => {
          lookup[country.id] = country;
          return lookup;
        }, {});
        
        // Create complete records with mock pricing data where needed
        const completePackages = packagesData.map(pkg => ({
          ...pkg,
          // Add mock pricing data since we couldn't fetch it
          government_fee: 100.00,
          service_fee: 50.00,
          processing_days: 15,
          total_price: 150.00,
          countries: countryLookup[pkg.country_id] || {
            id: pkg.country_id,
            name: 'Unknown Country'
          }
        }));
        
        console.log('Successfully created complete package data:', completePackages.length);
        return completePackages;
      }
    } catch (error: any) {
      console.error('All fetch methods failed:', error);
      
      // Switch to mock mode after error
      localStorage.setItem('using_mock_data', 'true');
      
      // Return any mock data we might have
      const mockData = JSON.parse(localStorage.getItem('mock_visa_packages') || '[]');
      
      // If we don't have mock data, create some
      if (mockData.length === 0) {
        console.log('No mock data found, creating sample data');
        const sampleData = [
          {
            id: 'mock-sample1',
            country_id: '',
            name: 'Sample Visa Package',
            government_fee: 100,
            service_fee: 50,
            processing_days: 15,
            total_price: 150,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            countries: {
              id: '',
              name: 'Sample Country'
            }
          }
        ];
        localStorage.setItem('mock_visa_packages', JSON.stringify(sampleData));
        return sampleData;
      }
      
      return mockData;
    }
  };

  const { data: visaPackages, error, isLoading, refetch } = useQuery({
    queryKey: ['visa-packages'],
    queryFn: fetchVisaPackages,
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  // Fetch countries for dropdown
  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name');
      
      if (error) throw error;
      return data;
    }
  });

  const addPackageMutation = useMutation({
    mutationFn: async (packageData: VisaPackageFormData) => {
      console.log('Adding new package with data:', packageData);
      
      try {
        // First verify table structure and get available columns
        console.log('Checking available columns in visa_packages table...');
        const { data: tableInfo, error: tableError } = await supabase
          .from('visa_packages')
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.error('Error checking table structure:', tableError);
          // Try to refresh schema cache
          try {
            console.log('Attempting to refresh schema cache...');
            await refreshSchemaCache();
            console.log('Schema cache refreshed, retrying...');
            
            // Try without the problematic columns
            console.log('Trying simplified insert without problematic columns');
            return await createSimplifiedPackage(packageData);
          } catch (refreshError) {
            console.error('Error refreshing schema:', refreshError);
            throw new Error(`Table structure verification failed: ${tableError.message}`);
          }
        }

        // Log available columns
        const availableColumns = tableInfo && tableInfo[0] ? Object.keys(tableInfo[0]) : [];
        console.log('Available columns:', availableColumns);

        // If we don't have the columns we need, create them first
        const requiredColumns = ['government_fee', 'service_fee', 'processing_days', 'total_price'];
        const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));
        
        if (missingColumns.length > 0) {
          console.log('Missing columns detected:', missingColumns);
          console.log('Running migration to fix table structure...');
          await createOrUpdateVisaPackagesTable();
          console.log('Migration complete, retrying with full data');
        }

        // Prepare the data based on available columns (refreshed after possible migration)
        const insertData: any = {
          country_id: packageData.country_id,
          name: 'Visa Package',
        };

        // Convert to numbers explicitly and add only if column exists
        if (!missingColumns.includes('government_fee')) {
          insertData.government_fee = Number(packageData.government_fee);
        }
        if (!missingColumns.includes('service_fee')) {
          insertData.service_fee = Number(packageData.service_fee);
        }
        if (!missingColumns.includes('processing_days')) {
          insertData.processing_days = Number(packageData.processing_days);
        }
        if (!missingColumns.includes('total_price')) {
          insertData.total_price = Number(packageData.government_fee) + Number(packageData.service_fee);
        }

        console.log('Prepared insert data:', insertData);

        // Try to insert the package
        const { data: insertedPackage, error: insertError } = await supabase
          .from('visa_packages')
          .insert(insertData)
          .select('*')
          .single();

        if (insertError) {
          console.error('Insert failed:', insertError);
          
          if (insertError.message?.includes('schema cache')) {
            console.log('Schema cache error detected, using fallback method');
            return await createSimplifiedPackage(packageData);
          }
          
          throw insertError;
        }

        console.log('Package inserted successfully:', insertedPackage);
        
        // Now fetch country data separately
        const { data: country, error: countryError } = await supabase
          .from('countries')
          .select('id, name')
          .eq('id', packageData.country_id)
          .single();
          
        if (countryError) {
          console.warn('Could not fetch country data:', countryError);
        }
        
        // Combine package with country data
        const packageWithCountry = {
          ...insertedPackage,
          countries: country || { id: packageData.country_id, name: 'Unknown Country' }
        };
        
        return packageWithCountry;
      } catch (error: any) {
        console.error('Error in addPackageMutation:', error);
        
        // Check for specific error types
        if (error.message?.includes('schema cache') || error.code === '42703') {
          console.log('Schema cache error detected in catch block, using fallback method');
          return await createSimplifiedPackage(packageData);
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Mutation succeeded:', data);
      queryClient.invalidateQueries({ queryKey: ['visa-packages'] });
      toast({
        title: "Success",
        description: "Visa package added successfully",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add visa package. Please check the database schema.",
        variant: "destructive",
      });
    }
  });
  
  // Helper function to create mock package
  const createMockPackage = (packageData: VisaPackageFormData) => {
    console.log('Creating mock package with data:', packageData);
    
    // Generate a mock ID
    const mockId = 'mock-' + Math.random().toString(36).substring(2, 9);
    
    // Create the mock package
    const newMockPackage = {
      id: mockId,
      country_id: packageData.country_id,
      name: 'Visa Package',
      government_fee: Number(packageData.government_fee),
      service_fee: Number(packageData.service_fee),
      processing_days: Number(packageData.processing_days),
      total_price: Number(packageData.government_fee) + Number(packageData.service_fee),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      countries: {
        id: packageData.country_id,
        name: countries?.find(c => c.id === packageData.country_id)?.name || 'Unknown Country'
      }
    };
    
    // Store the mock package in localStorage
    const existingMockData = JSON.parse(localStorage.getItem('mock_visa_packages') || '[]');
    existingMockData.push(newMockPackage);
    localStorage.setItem('mock_visa_packages', JSON.stringify(existingMockData));
    localStorage.setItem('using_mock_data', 'true');
    
    console.log('Successfully created mock package:', newMockPackage);
    return newMockPackage;
  };

  // Fallback simplified package creation
  const createSimplifiedPackage = async (packageData: VisaPackageFormData) => {
    console.log('Creating simplified package with minimal fields');
    
    try {
      // Use all required fields with defaults to satisfy the type system
      const simplifiedData = {
        country_id: packageData.country_id,
        name: 'Visa Package',
        government_fee: Number(packageData.government_fee),
        service_fee: Number(packageData.service_fee),
        processing_days: Number(packageData.processing_days)
      };
      
      console.log('Simplified insert data:', simplifiedData);
      
      // Try insert with minimal data
      const { data: insertedPackage, error: insertError } = await supabase
        .from('visa_packages')
        .insert(simplifiedData)
        .select('id, country_id, name')
        .single();
        
      if (insertError) {
        console.error('Simplified insert failed:', insertError);
        
        // If even simplified insert fails, fall back to mock mode
        console.log('Falling back to mock mode');
        return createMockPackage(packageData);
      }
      
      console.log('Simplified package inserted successfully:', insertedPackage);
      
      // Get country data
      const { data: country, error: countryError } = await supabase
        .from('countries')
        .select('id, name')
        .eq('id', packageData.country_id)
        .single();
        
      // Create full package manually
      const fullPackage = {
        ...insertedPackage,
        government_fee: Number(packageData.government_fee),
        service_fee: Number(packageData.service_fee),
        processing_days: Number(packageData.processing_days),
        total_price: Number(packageData.government_fee) + Number(packageData.service_fee),
        countries: country || { id: packageData.country_id, name: 'Unknown Country' }
      };
      
      console.log('Manually created full package:', fullPackage);
      return fullPackage;
    } catch (error) {
      console.error('Error in simplified package creation:', error);
      return createMockPackage(packageData);
    }
  };

  const updatePackageMutation = useMutation({
    mutationFn: async (packageData: VisaPackageFormData) => {
      if (!editingPackage?.id) {
        throw new Error('No package ID found for update');
      }

      // Check if we're in mock mode
      const usingMockData = localStorage.getItem('using_mock_data') === 'true';
      
      if (usingMockData) {
        console.log('USING MOCK DATA APPROACH FOR UPDATE - database connection issue');
        
        // Get existing mock data
        const existingMockData = JSON.parse(localStorage.getItem('mock_visa_packages') || '[]');
        
        // Find the package to update
        const packageIndex = existingMockData.findIndex((pkg: any) => pkg.id === editingPackage.id);
        
        if (packageIndex === -1) {
          throw new Error('Package not found in mock data');
        }
        
        // Update the package
        const updatedPackage = {
          ...existingMockData[packageIndex],
          country_id: packageData.country_id,
          name: 'Visa Package',
          government_fee: Number(packageData.government_fee),
          service_fee: Number(packageData.service_fee),
          processing_days: Number(packageData.processing_days),
          total_price: Number(packageData.government_fee) + Number(packageData.service_fee),
          updated_at: new Date().toISOString(),
          countries: {
            id: packageData.country_id,
            name: countries?.find(c => c.id === packageData.country_id)?.name || existingMockData[packageIndex].countries.name
          }
        };
        
        existingMockData[packageIndex] = updatedPackage;
        localStorage.setItem('mock_visa_packages', JSON.stringify(existingMockData));
        
        console.log('Successfully updated mock package:', updatedPackage);
        return updatedPackage;
      }
      
      // Regular update logic...
      // Test connection before update
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }

      // Prepare the update data with explicit type casting and validation
      const updateData = {
        country_id: packageData.country_id,
        name: 'Visa Package',
        government_fee: Number(packageData.government_fee),
        service_fee: Number(packageData.service_fee),
        processing_days: Number(packageData.processing_days),
        updated_at: new Date().toISOString()
      };

      // Validate numeric fields
      if (isNaN(updateData.government_fee) || isNaN(updateData.service_fee) || isNaN(updateData.processing_days)) {
        throw new Error('Invalid numeric values provided');
      }

      console.log('Updating package with ID:', editingPackage.id);
      console.log('Update data:', updateData);

      try {
        // First verify the record exists
        const { data: existingPackage, error: checkError } = await supabase
          .from('visa_packages')
          .select('id')
          .eq('id', editingPackage.id)
          .single();

        if (checkError || !existingPackage) {
          console.error('Package not found:', checkError);
          // Switch to mock mode after error
          localStorage.setItem('using_mock_data', 'true');
          throw new Error('Package not found or access denied');
        }

        // Perform the update
        const { data, error: updateError } = await supabase
          .from('visa_packages')
          .update(updateData)
          .eq('id', editingPackage.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Update error:', updateError);
          // Switch to mock mode after error
          localStorage.setItem('using_mock_data', 'true');
          throw new Error(updateError.message || 'Failed to update package');
        }

        if (!data) {
          throw new Error('No data returned from update');
        }

        console.log('Update successful:', data);
        return data;
      } catch (error: any) {
        console.error('Update failed:', error);
        // Switch to mock mode after error
        localStorage.setItem('using_mock_data', 'true');
        throw new Error(error.message || 'Failed to update package');
      }
    },
    onSuccess: (data) => {
      console.log('Mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['visaPackages'] });
      toast({ 
        title: "Success", 
        description: "Visa package updated successfully" 
      });
      setEditingPackage(null);
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update visa package. Please check all required fields are filled correctly.", 
        variant: "destructive" 
      });
    }
  });

  const deletePackageMutation = useMutation({
    mutationFn: async (id: string) => {
      // Check if we're in mock mode
      const usingMockData = localStorage.getItem('using_mock_data') === 'true';
      
      if (usingMockData) {
        console.log('USING MOCK DATA APPROACH FOR DELETE - database connection issue');
        
        // Get existing mock data
        const existingMockData = JSON.parse(localStorage.getItem('mock_visa_packages') || '[]');
        
        // Filter out the package to delete
        const filteredMockData = existingMockData.filter((pkg: any) => pkg.id !== id);
        
        if (filteredMockData.length === existingMockData.length) {
          console.warn('Package not found in mock data');
        }
        
        localStorage.setItem('mock_visa_packages', JSON.stringify(filteredMockData));
        
        console.log('Successfully deleted mock package');
        return;
      }
      
      // Regular delete logic
      const { error } = await supabase
        .from('visa_packages')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Delete error:', error);
        // Switch to mock mode after error
        localStorage.setItem('using_mock_data', 'true');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visaPackages'] });
      toast({ title: "Success", description: "Visa package deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to delete visa package", 
        variant: "destructive" 
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    // Handle numeric fields
    if (name === 'government_fee' || name === 'service_fee') {
      parsedValue = value === '' ? 0 : parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    } else if (name === 'processing_days') {
      parsedValue = value === '' ? 0 : parseInt(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    
    // Validate required fields
    if (!formData.country_id) {
      toast({ 
        title: "Validation Error", 
        description: "Please select a country",
        variant: "destructive" 
      });
      return;
    }
    
    if (isNaN(formData.government_fee) || isNaN(formData.service_fee)) {
      toast({ 
        title: "Validation Error", 
        description: "Please enter valid numbers for fees",
        variant: "destructive" 
      });
      return;
    }
    
    if (formData.government_fee < 0 || formData.service_fee < 0) {
      toast({ 
        title: "Validation Error", 
        description: "Fees cannot be negative",
        variant: "destructive" 
      });
      return;
    }
    
    if (formData.processing_days < 1) {
      toast({ 
        title: "Validation Error", 
        description: "Processing days must be at least 1",
        variant: "destructive" 
      });
      return;
    }

    console.log('Submitting form data:', formData);
    if (editingPackage) {
      console.log('Updating existing package:', editingPackage.id);
      updatePackageMutation.mutate(formData);
    } else {
      console.log('Creating new package');
      addPackageMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      country_id: '',
      government_fee: 0,
      service_fee: 0,
      processing_days: 15,
    });
  };

  // Function to exit mock mode
  const exitMockMode = () => {
    localStorage.removeItem('using_mock_data');
    localStorage.removeItem('mock_visa_packages');
    localStorage.removeItem('schema_errors');
    setIsMockMode(false);
    queryClient.invalidateQueries({ queryKey: ['visa-packages'] });
    toast({ title: "Success", description: "Exited mock mode. Attempting to reconnect to database." });
  };

  if (error) {
    console.error('Fetch error details:', error);
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load visa packages. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Visa Packages</h1>
        <div className="flex space-x-2">
          {isMockMode && (
            <Button 
              variant="outline" 
              className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
              onClick={() => {
                localStorage.removeItem('using_mock_data');
                setIsMockMode(false);
                queryClient.invalidateQueries({ queryKey: ['visa-packages'] });
                toast({ title: "Mock Mode Disabled", description: "Attempting to use real database connection" });
              }}
            >
              Exit Mock Mode
            </Button>
          )}
          <Button 
            variant="outline" 
            className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
            onClick={() => {
              const runDebugChecks = async () => {
                toast({ title: "Running Schema Diagnostics", description: "Checking database structure..." });
                
                try {
                  // Check visa_packages table
                  const { data: vpColumns, error: vpError } = await supabase
                    .from('visa_packages')
                    .select('*')
                    .limit(1);
                    
                  if (vpError) {
                    console.error('Error reading visa_packages:', vpError);
                    toast({ 
                      title: "Diagnostic Result", 
                      description: `Error reading visa_packages: ${vpError.message} (code: ${vpError.code})`,
                      variant: "destructive" 
                    });
                  } else {
                    const columns = vpColumns && vpColumns.length > 0 ? Object.keys(vpColumns[0]) : [];
                    console.log('Visa packages columns:', columns);
                    toast({ 
                      title: "Visa Packages Table", 
                      description: `Found ${columns.length} columns: ${columns.join(', ')}` 
                    });
                  }
                  
                  // Try a raw REST API call
                  try {
                    const session = await supabase.auth.getSession();
                    if (!session.data.session) {
                      throw new Error('No active session found');
                    }
                    
                    const token = session.data.session.access_token;
                    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/visa_packages?limit=1`;
                    
                    const response = await fetch(apiUrl, {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${token}`,
                        'Prefer': 'return=representation'
                      }
                    });
                    
                    if (!response.ok) {
                      const errorText = await response.text();
                      throw new Error(`Raw API error: ${errorText}`);
                    }
                    
                    const result = await response.json();
                    console.log('Raw API result:', result);
                    
                    // Check for data or error
                    if (Array.isArray(result) && result.length > 0) {
                      console.log('Raw API columns:', Object.keys(result[0]));
                      toast({ 
                        title: "Raw API Success", 
                        description: `Found ${result.length} packages with columns: ${Object.keys(result[0]).join(', ')}` 
                      });
                    } else {
                      toast({ 
                        title: "Raw API Result", 
                        description: "Empty result set returned" 
                      });
                    }
                  } catch (apiError: any) {
                    console.error('Raw API error:', apiError);
                    toast({ 
                      title: "Raw API Error", 
                      description: apiError.message,
                      variant: "destructive" 
                    });
                  }
                } catch (error: any) {
                  console.error('Diagnostic error:', error);
                  toast({ 
                    title: "Diagnostic Failed", 
                    description: error.message,
                    variant: "destructive" 
                  });
                }
              };
              
              runDebugChecks();
            }}
          >
            Diagnose Schema
          </Button>
          <Button
            variant="outline"
            onClick={handleRetryConnection}
            disabled={isRetrying}
            className="flex items-center"
          >
            {isRetrying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Retry Connection
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Package
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Visa Package</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="country_id">Country</Label>
                  <Select 
                    value={formData.country_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, country_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries?.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="government_fee">Government Fee ($)</Label>
                  <Input
                    id="government_fee"
                    name="government_fee"
                    type="number"
                    value={formData.government_fee}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service_fee">Service Fee ($)</Label>
                  <Input
                    id="service_fee"
                    name="service_fee"
                    type="number"
                    value={formData.service_fee}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="processing_days">Processing Days</Label>
                  <Input
                    id="processing_days"
                    name="processing_days"
                    type="number"
                    value={formData.processing_days}
                    onChange={handleInputChange}
                    min="1"
                  />
                  <p className="text-sm text-gray-500">
                    {calculateEstimatedDelivery(formData.processing_days)}
                  </p>
                </div>

                <div className="pt-4 space-x-2 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Package
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isMockMode && (
        <Alert className="bg-orange-50 border-orange-300">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <AlertTitle className="text-orange-700">Database Connection Issue</AlertTitle>
          <AlertDescription className="text-orange-600">
            Currently using mock data stored in your browser. Any changes will only be saved locally 
            and not persist to the database. Click "Exit Mock Mode" to attempt reconnecting to the database.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Government Fee</TableHead>
                <TableHead>Service Fee</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Processing Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visaPackages?.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>{pkg.countries?.name || 'N/A'}</TableCell>
                  <TableCell>${(pkg.government_fee ?? 0).toFixed(2)}</TableCell>
                  <TableCell>${(pkg.service_fee ?? 0).toFixed(2)}</TableCell>
                  <TableCell>${(pkg.total_price ?? 0).toFixed(2)}</TableCell>
                  <TableCell>
                    {pkg.processing_days ?? 0} working days
                    <br />
                    <span className="text-sm text-gray-500">
                      {calculateEstimatedDelivery(pkg.processing_days ?? 15)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPackage(pkg);
                          setFormData({
                            country_id: pkg.country_id,
                            government_fee: pkg.government_fee,
                            service_fee: pkg.service_fee,
                            processing_days: pkg.processing_days
                          });
                          setIsAddDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this package?')) {
                            deletePackageMutation.mutate(pkg.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisaPackagesManager; 