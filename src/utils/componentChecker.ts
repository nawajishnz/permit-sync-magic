import { supabase } from '@/integrations/supabase/client';

/**
 * A utility to check if a component can be rendered by verifying its data dependencies
 */
export const verifyComponent = async (componentName: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    console.log(`Verifying component: ${componentName}`);
    
    // Check authentication first
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return {
        success: false,
        message: "Authentication required. Please sign in as an admin."
      };
    }
    
    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.session.user.id)
      .single();
      
    if (profileError || profile?.role !== 'admin') {
      return {
        success: false,
        message: "Admin privileges required to access this component."
      };
    }
    
    // Component-specific checks
    switch (componentName) {
      case 'AdminHome':
        // Basic validation - check if we can fetch data for the dashboard
        const results = await Promise.allSettled([
          supabase.from('visa_applications').select('count').single(),
          supabase.from('profiles').select('count').single(),
          supabase.from('countries').select('count').single()
        ]);
        
        const errors = results
          .filter(result => result.status === 'rejected')
          .map(result => (result as PromiseRejectedResult).reason);
          
        if (errors.length > 0) {
          return {
            success: false,
            message: `Error fetching data for AdminHome: ${errors.join(', ')}`
          };
        }
        
        return {
          success: true,
          message: "AdminHome component can be rendered successfully",
          data: results.map(r => r.status === 'fulfilled' ? (r as PromiseFulfilledResult<any>).value : null)
        };
        
      case 'CountriesManager':
        // Check if we can access the countries table
        const { data: countries, error: countriesError } = await supabase
          .from('countries')
          .select('id, name')
          .limit(1);
          
        if (countriesError) {
          return {
            success: false,
            message: `Error accessing countries data: ${countriesError.message}`
          };
        }
        
        return {
          success: true,
          message: "CountriesManager component can be rendered successfully",
          data: { countries }
        };
        
      case 'VisaTypesManager':
        // Check if we can access visa types and countries
        const [visaTypesResult, countriesForVisaResult] = await Promise.all([
          supabase.from('visa_types').select('id, name').limit(1),
          supabase.from('countries').select('id, name').limit(1)
        ]);
        
        if (visaTypesResult.error) {
          return {
            success: false,
            message: `Error accessing visa types: ${visaTypesResult.error.message}`
          };
        }
        
        if (countriesForVisaResult.error) {
          return {
            success: false,
            message: `Error accessing countries for visa types: ${countriesForVisaResult.error.message}`
          };
        }
        
        return {
          success: true,
          message: "VisaTypesManager component can be rendered successfully",
          data: {
            visaTypes: visaTypesResult.data,
            countries: countriesForVisaResult.data
          }
        };
        
      case 'PackagesManager':
        // Check if we can access packages
        const { data: packages, error: packagesError } = await supabase
          .from('visa_packages')
          .select('id, name')
          .limit(1);
          
        if (packagesError) {
          return {
            success: false,
            message: `Error accessing packages data: ${packagesError.message}`
          };
        }
        
        return {
          success: true,
          message: "PackagesManager component can be rendered successfully",
          data: { packages }
        };
        
      case 'ApplicationsManager':
        // Check if we can access visa applications
        const { data: applications, error: applicationsError } = await supabase
          .from('visa_applications')
          .select('id, status')
          .limit(1);
          
        if (applicationsError) {
          return {
            success: false,
            message: `Error accessing applications data: ${applicationsError.message}`
          };
        }
        
        return {
          success: true,
          message: "ApplicationsManager component can be rendered successfully",
          data: { applications }
        };
        
      case 'UsersManager':
        // Check if we can access user profiles
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .limit(1);
          
        if (usersError) {
          return {
            success: false,
            message: `Error accessing users data: ${usersError.message}`
          };
        }
        
        return {
          success: true,
          message: "UsersManager component can be rendered successfully",
          data: { users }
        };
        
      case 'FAQsManager':
        // Since FAQs might be stored as JSONB in other tables, just check if we can query countries
        const { data: countriesForFaq, error: faqsError } = await supabase
          .from('countries')
          .select('id, name, faq')
          .limit(1);
          
        if (faqsError) {
          return {
            success: false,
            message: `Error accessing FAQs data: ${faqsError.message}`
          };
        }
        
        return {
          success: true,
          message: "FAQsManager component can be rendered successfully",
          data: { countries: countriesForFaq }
        };
        
      case 'AddonServicesManager':
        // Check if we can access addon services
        const { data: addonServices, error: addonServicesError } = await supabase
          .from('addon_services')
          .select('id, name')
          .limit(1);
          
        if (addonServicesError) {
          return {
            success: false,
            message: `Error accessing addon services data: ${addonServicesError.message}`
          };
        }
        
        return {
          success: true,
          message: "AddonServicesManager component can be rendered successfully",
          data: { addonServices }
        };
        
      case 'TestimonialsManager':
        // Check if we can access testimonials
        const { data: testimonials, error: testimonialsError } = await supabase
          .from('testimonials')
          .select('id, name')
          .limit(1);
          
        if (testimonialsError) {
          return {
            success: false,
            message: `Error accessing testimonials data: ${testimonialsError.message}`
          };
        }
        
        return {
          success: true,
          message: "TestimonialsManager component can be rendered successfully",
          data: { testimonials }
        };
        
      case 'AnalyticsDashboard':
        // This is more of a UI component, so we'll just check if basic data tables exist
        const analyticsChecks = await Promise.allSettled([
          supabase.from('visa_applications').select('count').single(),
          supabase.from('profiles').select('count').single()
        ]);
        
        const analyticsErrors = analyticsChecks
          .filter(result => result.status === 'rejected')
          .map(result => (result as PromiseRejectedResult).reason);
          
        if (analyticsErrors.length > 0) {
          return {
            success: false,
            message: `Error accessing analytics data: ${analyticsErrors.join(', ')}`
          };
        }
        
        return {
          success: true,
          message: "AnalyticsDashboard component can be rendered successfully"
        };
        
      default:
        return {
          success: false,
          message: `Unknown component: ${componentName}`
        };
    }
  } catch (error) {
    console.error(`Error verifying component ${componentName}:`, error);
    return {
      success: false,
      message: `Error verifying component ${componentName}: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Verify all admin components at once
 */
export const verifyAllComponents = async (): Promise<{ 
  allSuccessful: boolean;
  results: Record<string, { success: boolean; message: string; data?: any }>
}> => {
  const componentNames = [
    'AdminHome',
    'CountriesManager',
    'VisaTypesManager',
    'PackagesManager',
    'ApplicationsManager',
    'UsersManager',
    'FAQsManager',
    'AddonServicesManager',
    'TestimonialsManager',
    'AnalyticsDashboard'
  ];
  
  const results: Record<string, { success: boolean; message: string; data?: any }> = {};
  
  for (const componentName of componentNames) {
    results[componentName] = await verifyComponent(componentName);
  }
  
  const allSuccessful = Object.values(results).every(result => result.success);
  
  return {
    allSuccessful,
    results
  };
}; 