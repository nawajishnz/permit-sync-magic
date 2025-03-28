
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart, ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Line, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('month');
  
  // Fetch visa applications data
  const { data: applicationsData, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['applications-analytics'],
    queryFn: async () => {
      // Fetch total applications with their types and submission dates
      const { data: applications, error } = await supabase
        .from('visa_applications')
        .select(`
          id,
          status,
          submitted_date,
          visa_type_id,
          visa_types(name)
        `)
        .order('submitted_date', { ascending: false });
        
      if (error) throw error;
      return applications || [];
    }
  });

  // Fetch revenue data (from packages connected to applications)
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['revenue-analytics'],
    queryFn: async () => {
      // Fetch applications with their packages to calculate revenue
      const { data: applications, error } = await supabase
        .from('visa_applications')
        .select(`
          submitted_date,
          package_id,
          visa_packages(price)
        `)
        .order('submitted_date', { ascending: false });
        
      if (error) throw error;
      return applications || [];
    }
  });

  // Fetch countries data
  const { data: countriesData, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries-analytics'],
    queryFn: async () => {
      // Fetch applications with their destination countries
      const { data: applications, error } = await supabase
        .from('visa_applications')
        .select(`
          visa_type_id,
          visa_types(country_id, countries(name))
        `);
        
      if (error) throw error;
      return applications || [];
    }
  });

  // Process the applications data to group by month
  const processedApplicationData = React.useMemo(() => {
    if (!applicationsData || applicationsData.length === 0) return [];

    // Group applications by month
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach(month => {
      monthlyData[month] = { name: month, tourist: 0, business: 0, student: 0 };
    });

    applicationsData.forEach(app => {
      const date = new Date(app.submitted_date);
      const monthName = months[date.getMonth()];
      
      // Categorize by visa type (simplified for demo)
      const visaTypeName = app.visa_types?.name?.toLowerCase() || '';
      
      if (visaTypeName.includes('tourist')) {
        monthlyData[monthName].tourist += 1;
      } else if (visaTypeName.includes('business')) {
        monthlyData[monthName].business += 1;
      } else if (visaTypeName.includes('student')) {
        monthlyData[monthName].student += 1;
      } else {
        // Default to tourist for this example
        monthlyData[monthName].tourist += 1;
      }
    });

    return Object.values(monthlyData);
  }, [applicationsData]);

  // Process revenue data
  const processedRevenueData = React.useMemo(() => {
    if (!revenueData || revenueData.length === 0) return [];

    // Group revenue by month
    const monthlyRevenue = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach(month => {
      monthlyRevenue[month] = { name: month, revenue: 0 };
    });

    revenueData.forEach(app => {
      const date = new Date(app.submitted_date);
      const monthName = months[date.getMonth()];
      
      // Extract price and convert to number
      let price = 0;
      if (app.visa_packages?.price) {
        // Remove currency symbol and convert to number
        price = parseFloat(app.visa_packages.price.replace(/[^0-9.-]+/g, '')) || 0;
      }
      
      monthlyRevenue[monthName].revenue += price;
    });

    return Object.values(monthlyRevenue);
  }, [revenueData]);

  // Process country data
  const processedCountryData = React.useMemo(() => {
    if (!countriesData || countriesData.length === 0) return [];

    // Count applications by country
    const countryCount = {};
    
    countriesData.forEach(app => {
      const countryName = app.visa_types?.countries?.name;
      
      if (countryName) {
        if (!countryCount[countryName]) {
          countryCount[countryName] = 0;
        }
        countryCount[countryName] += 1;
      }
    });

    // Convert to array format for chart
    return Object.entries(countryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) // Sort by count, highest first
      .slice(0, 5); // Take top 5
  }, [countriesData]);

  // For conversion funnel data
  const conversionData = React.useMemo(() => {
    if (!applicationsData) return [];
    
    // Mocked values for visit and started applications
    const totalApplications = applicationsData.length;
    const estimatedVisits = totalApplications * 3; // Assuming 3x the applications for site visits
    const estimatedStarted = Math.round(totalApplications * 1.5); // Assuming 50% more started than completed
    
    // Count completed applications
    const completedApplications = applicationsData.filter(app => 
      app.status === 'approved' || app.status === 'completed'
    ).length;
    
    return [
      { name: 'Visits', value: estimatedVisits },
      { name: 'Applications Started', value: estimatedStarted },
      { name: 'Applications Completed', value: totalApplications },
      { name: 'Approved', value: completedApplications },
    ];
  }, [applicationsData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const isLoading = isLoadingApplications || isLoadingRevenue || isLoadingCountries;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-4 border-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Analytics Dashboard</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="quarter">Last 3 months</SelectItem>
            <SelectItem value="year">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="w-full mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="countries">Countries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-6 mb-8 grid-cols-1 lg:grid-cols-2">
            {/* Revenue Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={processedRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Application Types */}
            <Card>
              <CardHeader>
                <CardTitle>Applications by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedApplicationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="tourist" fill="#10b981" />
                      <Bar dataKey="business" fill="#3b82f6" />
                      <Bar dataKey="student" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 mb-8 grid-cols-1 lg:grid-cols-2">
            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={conversionData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Popular Countries */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Destination Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {processedCountryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={processedCountryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {processedCountryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} applications`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No country data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Applications Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedApplicationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tourist" fill="#10b981" />
                    <Bar dataKey="business" fill="#3b82f6" />
                    <Bar dataKey="student" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="countries">
          <Card>
            <CardHeader>
              <CardTitle>Popular Destination Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {processedCountryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={processedCountryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {processedCountryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} applications`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No country data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
