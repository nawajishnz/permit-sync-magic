import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: string;
  submitted_date: string;
  status?: string; // Added status property
  visa_packages?: {
    price: string | number;
  } | null;
}

const AnalyticsDashboard = () => {
  const { toast } = useToast();

  const { data: applicationsData, isLoading: isApplicationsLoading, isError: isApplicationsError } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visa_applications')
        .select(`
          id,
          submitted_date,
          status,
          visa_packages (
            price
          )
        `);

      if (error) {
        throw error;
      }

      return data as Application[];
    },
  });

  const { data: revenueData, isLoading: isRevenueLoading, isError: isRevenueError } = useQuery({
    queryKey: ['revenue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visa_applications')
        .select(`
          id,
          submitted_date,
          visa_packages (
            price
          )
        `);

      if (error) {
        throw error;
      }

      return data as Application[];
    },
  });

  React.useEffect(() => {
    if (isApplicationsError) {
      toast({
        title: "Error fetching applications",
        description: "Failed to load applications data",
        variant: "destructive",
      });
    }

    if (isRevenueError) {
      toast({
        title: "Error fetching revenue data",
        description: "Failed to load revenue data",
        variant: "destructive",
      });
    }
  }, [isApplicationsError, isRevenueError, toast]);

  const processedApplicationsData = React.useMemo(() => {
    if (!applicationsData || applicationsData.length === 0) return [];

    const statuses = ['Pending', 'In Progress', 'Completed', 'Rejected'];
    const monthlyCounts = statuses.reduce((acc, status) => {
      acc[status] = {};
      return acc;
    }, {} as Record<string, Record<string, number>>);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    applicationsData.forEach(app => {
      const date = new Date(app.submitted_date);
      const monthName = months[date.getMonth()];

      // Get status from the application or default to 'Pending'
      const status = app.status || 'Pending';

      if (!monthlyCounts[status]) {
        monthlyCounts[status] = {};
      }

      monthlyCounts[status][monthName] = (monthlyCounts[status][monthName] || 0) + 1;
    });

    const monthlyData = months.map(month => {
      const monthData: { name: string; [key: string]: number | string } = { name: month };
      statuses.forEach(status => {
        monthData[status] = monthlyCounts[status][month] || 0;
      });
      return monthData;
    });

    return monthlyData;
  }, [applicationsData]);

  // Process revenue data
  const processedRevenueData = React.useMemo(() => {
    if (!revenueData || revenueData.length === 0) return [];

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenue = months.reduce((acc, month) => {
      acc[month] = { name: month, revenue: 0 };
      return acc;
    }, {} as Record<string, { name: string; revenue: number }>);

    // Process each application
    revenueData.forEach(app => {
      if (!app.visa_packages) return;
      
      const date = new Date(app.submitted_date);
      const monthName = months[date.getMonth()];
      
      // Extract price and convert to number
      let price = 0;
      if (app.visa_packages?.price) {
        // Convert to string first to ensure we can use string methods
        const priceString = String(app.visa_packages.price);
        // Remove currency symbol and convert to number
        price = parseFloat(priceString.replace(/[^0-9.-]+/g, '')) || 0;
      }
      
      if (monthlyRevenue[monthName]) {
        monthlyRevenue[monthName].revenue += price;
      }
    });

    return Object.values(monthlyRevenue);
  }, [revenueData]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applications Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Applications Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isApplicationsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={processedApplicationsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="Pending" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="In Progress" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="Completed" stackId="1" stroke="#ffc658" fill="#ffc658" />
                  <Area type="monotone" dataKey="Rejected" stackId="1" stroke="#ff7373" fill="#ff7373" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isRevenueLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={processedRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(value)} />
                  <Area type="monotone" dataKey="revenue" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
