import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminDashboard } from '../components/Admin/AdminDashboard';
import { isAdmin } from '../lib/admin';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const AdminPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);
      
      // Check if user is admin
      const adminStatus = await isAdmin(user.id);
      setIsUserAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin access:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Checking admin access..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
};