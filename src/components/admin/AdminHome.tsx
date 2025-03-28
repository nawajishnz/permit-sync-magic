
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Globe, Calendar, Users, CreditCard, ArrowUp, ArrowDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminHome = () => {
  // Fetch applications data
  const { data: applications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['applications-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visa_applications')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch users data
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch countries data
  const { data: countries, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate stats
  const stats = React.useMemo(() => {
    return {
      applications: {
        total: applications?.length || 0,
        change: 0,
        trend: 'up',
      },
      revenue: {
        total: `$${(applications?.length || 0) * 250}`, // Simple calculation for demo
        change: 0,
        trend: 'up',
      },
      countries: {
        total: countries?.length || 0,
        change: 0,
        trend: 'up',
      },
      users: {
        total: users?.length || 0,
        change: 0,
        trend: 'up',
      },
    };
  }, [applications, countries, users]);

  const isLoading = isLoadingApplications || isLoadingUsers || isLoadingCountries;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-4 border-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats overview */}
      <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <div className="flex items-center mt-1">
                  <h3 className="text-2xl font-bold">{stats.applications.total}</h3>
                  <div className={`flex items-center ml-2 ${stats.applications.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {stats.applications.trend === 'up' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                    <span className="text-xs font-medium">{stats.applications.change}%</span>
                  </div>
                </div>
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
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <div className="flex items-center mt-1">
                  <h3 className="text-2xl font-bold">{stats.revenue.total}</h3>
                  <div className={`flex items-center ml-2 ${stats.revenue.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {stats.revenue.trend === 'up' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                    <span className="text-xs font-medium">{stats.revenue.change}%</span>
                  </div>
                </div>
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
                <p className="text-sm font-medium text-gray-500">Total Countries</p>
                <div className="flex items-center mt-1">
                  <h3 className="text-2xl font-bold">{stats.countries.total}</h3>
                  <div className={`flex items-center ml-2 ${stats.countries.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {stats.countries.trend === 'up' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                    <span className="text-xs font-medium">{stats.countries.change}%</span>
                  </div>
                </div>
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
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <div className="flex items-center mt-1">
                  <h3 className="text-2xl font-bold">{stats.users.total}</h3>
                  <div className={`flex items-center ml-2 ${stats.users.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {stats.users.trend === 'up' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                    <span className="text-xs font-medium">{stats.users.change}%</span>
                  </div>
                </div>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent applications */}
      <div className="grid gap-6 mb-8 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications && applications.length > 0 ? (
                applications.slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Visa Application</p>
                      <p className="text-sm text-gray-500">Status: {application.status}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(application.submitted_date).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No recent applications</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users && users.length > 0 ? (
                users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                    <div className="bg-orange-100 p-2 rounded-full mr-3">
                      <Users className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{user.full_name || 'User'}</p>
                      <p className="text-sm text-gray-500">Role: {user.role}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No recent users</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
