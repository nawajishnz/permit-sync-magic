import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Calendar, Users, CreditCard, ArrowUp, ArrowDown, RefreshCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const AdminHome = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState(null);

  // Simplified data fetching that focuses on reliability
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('AdminHome: Starting data fetch');
        setIsLoading(true);
        setError(null);
        
        // Verify admin session first
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) {
          console.error('AdminHome: No active session');
          setError('Authentication required');
          window.location.href = '/admin-login';
          return;
        }
        
        console.log('AdminHome: Session verified, fetching dashboard data');
        
        // Get data one by one to avoid overwhelming the API
        try {
          console.log('AdminHome: Fetching applications');
          const appsResponse = await supabase.from('visa_applications').select('*');
          if (appsResponse.error) {
            console.error('Error fetching applications:', appsResponse.error);
          } else {
            console.log(`AdminHome: Retrieved ${appsResponse.data?.length || 0} applications`);
            setApplications(appsResponse.data || []);
          }
        } catch (e) {
          console.error('Error in applications fetch:', e);
        }
        
        try {
          console.log('AdminHome: Fetching users');
          const usersResponse = await supabase.from('profiles').select('*');
          if (usersResponse.error) {
            console.error('Error fetching users:', usersResponse.error);
          } else {
            console.log(`AdminHome: Retrieved ${usersResponse.data?.length || 0} users`);
            setUsers(usersResponse.data || []);
          }
        } catch (e) {
          console.error('Error in users fetch:', e);
        }
        
        try {
          console.log('AdminHome: Fetching countries');
          const countriesResponse = await supabase.from('countries').select('*');
          if (countriesResponse.error) {
            console.error('Error fetching countries:', countriesResponse.error);
          } else {
            console.log(`AdminHome: Retrieved ${countriesResponse.data?.length || 0} countries`);
            setCountries(countriesResponse.data || []);
          }
        } catch (e) {
          console.error('Error in countries fetch:', e);
        }
        
        console.log('AdminHome: All data fetching complete');
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  // Stats calculated from whatever data we have
  const stats = {
    applications: {
      total: applications.length || 0,
      change: 0,
      trend: 'up',
    },
    revenue: {
      total: `$${(applications.length || 0) * 250}`,
      change: 0,
      trend: 'up',
    },
    countries: {
      total: countries.length || 0,
      change: 0,
      trend: 'up',
    },
    users: {
      total: users.length || 0,
      change: 0,
      trend: 'up',
    },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-700">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show an error state with refresh button
  if (error) {
    return (
      <div className="p-8 bg-red-50 rounded-lg text-center">
        <h3 className="text-red-600 font-medium mb-3">Error Loading Dashboard</h3>
        <p className="text-gray-700 mb-4">There was a problem loading the dashboard data</p>
        <Button 
          onClick={handleRefresh}
          variant="outline"
          className="bg-white border-red-300 text-red-700 hover:bg-red-50"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh Page
        </Button>
      </div>
    );
  }

  // Basic dashboard with stats and data
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh Page
        </Button>
      </div>

      {/* Stats overview */}
      <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Applications</p>
                <h3 className="text-2xl font-bold">{stats.applications.total}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Revenue</p>
                <h3 className="text-2xl font-bold">{stats.revenue.total}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Countries</p>
                <h3 className="text-2xl font-bold">{stats.countries.total}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Globe className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Users</p>
                <h3 className="text-2xl font-bold">{stats.users.total}</h3>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent items - simplified to improve reliability */}
      <div className="grid gap-6 mb-8 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Visa Application</p>
                      <p className="text-sm text-gray-500">Status: {application.status || 'Pending'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No recent applications</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length > 0 ? (
              <div className="space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                    <div className="bg-orange-100 p-2 rounded-full mr-3">
                      <Users className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{user.full_name || 'User'}</p>
                      <p className="text-sm text-gray-500">Role: {user.role || 'user'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No recent users</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
