
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Globe, Calendar, Users, CreditCard, ArrowUp, ArrowDown } from 'lucide-react';

const AdminHome = () => {
  // Mock data - in a real app, this would come from API/database
  const stats = {
    applications: {
      total: 245,
      change: 12,
      trend: 'up',
    },
    revenue: {
      total: '$14,250',
      change: 8,
      trend: 'up',
    },
    countries: {
      total: 32,
      change: 2,
      trend: 'up',
    },
    users: {
      total: 186,
      change: 3,
      trend: 'down',
    },
  };

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

      {/* Recent activity */}
      <div className="grid gap-6 mb-8 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center p-3 bg-gray-50 rounded-md">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Tourist Visa Application</p>
                    <p className="text-sm text-gray-500">User ID: USER{Math.floor(Math.random() * 10000)}</p>
                  </div>
                  <div className="text-sm text-gray-500">2h ago</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center p-3 bg-gray-50 rounded-md">
                  <div className="bg-orange-100 p-2 rounded-full mr-3">
                    <Users className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">New User Registration</p>
                    <p className="text-sm text-gray-500">Email: user{Math.floor(Math.random() * 10000)}@example.com</p>
                  </div>
                  <div className="text-sm text-gray-500">4h ago</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
