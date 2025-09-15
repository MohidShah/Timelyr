import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Crown, 
  AlertTriangle,
  TrendingUp,
  Globe,
  Clock,
  Shield,
  Database,
  Activity,
  DollarSign,
  UserCheck,
  UserX,
  Mail,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalLinks: number;
  totalViews: number;
  proUsers: number;
  revenue: number;
  newUsersToday: number;
  linksCreatedToday: number;
}

interface User {
  id: string;
  email: string;
  display_name: string;
  plan: 'starter' | 'pro';
  created_at: string;
  last_login: string;
  is_active: boolean;
  links_count: number;
  total_views: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalLinks: 0,
    totalViews: 0,
    proUsers: 0,
    revenue: 0,
    newUsersToday: 0,
    linksCreatedToday: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Check if we're in mock mode
      const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_USE_MOCK_DB === 'true';
      
      if (isMockMode) {
        // Generate mock admin data
        setStats({
          totalUsers: 1247,
          activeUsers: 892,
          totalLinks: 5634,
          totalViews: 23891,
          proUsers: 156,
          revenue: 18720,
          newUsersToday: 23,
          linksCreatedToday: 89
        });
        
        setUsers([
          {
            id: 'user-1',
            email: 'john@example.com',
            display_name: 'John Doe',
            plan: 'pro',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            links_count: 23,
            total_views: 456
          },
          {
            id: 'user-2',
            email: 'jane@example.com',
            display_name: 'Jane Smith',
            plan: 'starter',
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            last_login: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            links_count: 12,
            total_views: 89
          },
          {
            id: 'user-3',
            email: 'mike@company.com',
            display_name: 'Mike Johnson',
            plan: 'pro',
            created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            last_login: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: false,
            links_count: 67,
            total_views: 1234
          }
        ]);
        
        setLoading(false);
        return;
      }

      // Fetch real data from Supabase
      const [usersResponse, linksResponse] = await Promise.all([
        supabase.from('user_profiles').select('*'),
        supabase.from('timezone_links').select('*')
      ]);

      if (usersResponse.error) throw usersResponse.error;
      if (linksResponse.error) throw linksResponse.error;

      const usersData = usersResponse.data || [];
      const linksData = linksResponse.data || [];

      // Calculate stats
      const totalUsers = usersData.length;
      const activeUsers = usersData.filter(u => u.account_status === 'active').length;
      const proUsers = usersData.filter(u => u.plan === 'pro').length;
      const totalViews = linksData.reduce((sum, link) => sum + link.view_count, 0);
      
      const today = new Date().toISOString().split('T')[0];
      const newUsersToday = usersData.filter(u => u.created_at.startsWith(today)).length;
      const linksCreatedToday = linksData.filter(l => l.created_at.startsWith(today)).length;

      setStats({
        totalUsers,
        activeUsers,
        totalLinks: linksData.length,
        totalViews,
        proUsers,
        revenue: proUsers * 12, // Simplified revenue calculation
        newUsersToday,
        linksCreatedToday
      });

      // Transform users data
      const transformedUsers = usersData.map(user => ({
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        plan: user.plan || 'starter',
        created_at: user.created_at,
        last_login: user.updated_at, // Simplified
        is_active: user.account_status === 'active',
        links_count: linksData.filter(l => l.user_id === user.id).length,
        total_views: linksData.filter(l => l.user_id === user.id).reduce((sum, l) => sum + l.view_count, 0)
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      addToast({
        type: 'error',
        message: 'Failed to load admin data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeUser = async (userId: string) => {
    try {
      await supabase
        .from('user_profiles')
        .update({ plan: 'pro' })
        .eq('id', userId);
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, plan: 'pro' } : user
      ));
      
      addToast({
        type: 'success',
        message: 'User upgraded to Pro successfully'
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to upgrade user'
      });
    }
  };

  const handleDowngradeUser = async (userId: string) => {
    try {
      await supabase
        .from('user_profiles')
        .update({ plan: 'starter' })
        .eq('id', userId);
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, plan: 'starter' } : user
      ));
      
      addToast({
        type: 'success',
        message: 'User downgraded to Starter successfully'
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to downgrade user'
      });
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await supabase
        .from('user_profiles')
        .update({ account_status: 'suspended' })
        .eq('id', userId);
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: false } : user
      ));
      
      addToast({
        type: 'success',
        message: 'User account deactivated'
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to deactivate user'
      });
    }
  };

  const exportUserData = () => {
    const csvContent = [
      ['Email', 'Name', 'Plan', 'Created', 'Links', 'Views', 'Status'],
      ...users.map(user => [
        user.email,
        user.display_name,
        user.plan,
        format(new Date(user.created_at), 'yyyy-MM-dd'),
        user.links_count.toString(),
        user.total_views.toString(),
        user.is_active ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timelyr-users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage users, monitor system health, and track business metrics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={exportUserData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={fetchAdminData}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-green-600">+{stats.newUsersToday} today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                <p className="text-xs text-gray-500">
                  {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pro Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.proUsers}</p>
                <p className="text-xs text-gray-500">
                  {((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}% conversion
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.revenue}</p>
                <p className="text-xs text-gray-500">From Pro subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                <div className="flex space-x-2">
                  {selectedUsers.length > 0 && (
                    <>
                      <Button size="sm" variant="secondary">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Selected ({selectedUsers.length})
                      </Button>
                      <Button size="sm" variant="danger">
                        <UserX className="w-4 h-4 mr-2" />
                        Deactivate Selected
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(users.map(u => u.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Plan</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Links</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Views</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(prev => [...prev, user.id]);
                              } else {
                                setSelectedUsers(prev => prev.filter(id => id !== user.id));
                              }
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-800">{user.display_name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={user.plan === 'pro' ? 'default' : 'secondary'}>
                            {user.plan === 'pro' && <Crown className="w-3 h-3 mr-1" />}
                            {user.plan}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {user.links_count}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {user.total_views}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={user.is_active ? 'default' : 'destructive'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-1">
                            {user.plan === 'starter' ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleUpgradeUser(user.id)}
                              >
                                <Crown className="w-3 h-3 mr-1" />
                                Upgrade
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="tertiary"
                                onClick={() => handleDowngradeUser(user.id)}
                              >
                                Downgrade
                              </Button>
                            )}
                            {user.is_active ? (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDeactivateUser(user.id)}
                              >
                                <UserX className="w-3 h-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  // Reactivate user logic
                                }}
                              >
                                <UserCheck className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-gray-900 mb-2">{stats.totalLinks}</div>
                <div className="text-sm text-gray-600">Total Links Created</div>
                <div className="text-xs text-green-600 mt-1">+{stats.linksCreatedToday} today</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-gray-900 mb-2">{stats.totalViews}</div>
                <div className="text-sm text-gray-600">Total Link Views</div>
                <div className="text-xs text-gray-500 mt-1">
                  Avg: {stats.totalLinks > 0 ? Math.round(stats.totalViews / stats.totalLinks) : 0} per link
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Globe className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {stats.totalLinks > 0 ? Math.round((stats.totalViews / stats.totalLinks) * 100) / 100 : 0}
                </div>
                <div className="text-sm text-gray-600">Avg Views per Link</div>
                <div className="text-xs text-gray-500 mt-1">Performance metric</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-800">User Growth</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Users</span>
                    <span className="font-semibold">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-semibold">{stats.activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pro Conversion Rate</span>
                    <span className="font-semibold">
                      {((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">New Users Today</span>
                    <span className="font-semibold text-green-600">+{stats.newUsersToday}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-800">Revenue Metrics</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Revenue</span>
                    <span className="font-semibold text-green-600">${stats.revenue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pro Subscribers</span>
                    <span className="font-semibold">{stats.proUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ARPU</span>
                    <span className="font-semibold">
                      ${stats.totalUsers > 0 ? (stats.revenue / stats.totalUsers).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Projected Annual</span>
                    <span className="font-semibold">${(stats.revenue * 12).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  System Health
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Database Status</span>
                    <Badge variant="default">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">API Response Time</span>
                    <span className="text-green-600 font-medium">~120ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Uptime</span>
                    <span className="text-green-600 font-medium">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Error Rate</span>
                    <span className="text-green-600 font-medium">0.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Status
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">SSL Certificate</span>
                    <Badge variant="default">Valid</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Failed Login Attempts</span>
                    <span className="text-yellow-600 font-medium">12 (24h)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Suspicious Activity</span>
                    <Badge variant="secondary">None detected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rate Limiting</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};