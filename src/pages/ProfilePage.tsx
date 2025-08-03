import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Trash2, Camera, Save } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          username: data.username || '',
          email: data.email,
        });
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || '',
          username: null,
          avatar_url: null,
          plan: 'starter' as const,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;
        setProfile(createdProfile);
        setFormData({
          full_name: createdProfile.full_name || '',
          username: createdProfile.username || '',
          email: createdProfile.email,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Validate username uniqueness if changed
      if (formData.username && formData.username !== profile?.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', formData.username)
          .neq('id', user.id)
          .single();

        if (existingUser) {
          setErrors({ username: 'Username is already taken' });
          return;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name || null,
          username: formData.username || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      await fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrors({ general: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete user data first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete timezone links
      await supabase
        .from('timezone_links')
        .delete()
        .eq('user_id', user.id);

      // Delete profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      // Sign out
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-800">Profile Picture</h2>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Click to upload a new profile picture
              </p>
            </CardContent>
          </Card>

          {/* Account Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-800">Account Information</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                />

                <Input
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Choose a unique username"
                  error={errors.username}
                  helper="This will be used for custom link URLs: timelyr.com/@username/link-name"
                />


                {errors.general && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errors.general}</p>
                  </div>
                )}

                <Button onClick={handleSave} loading={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Plan Information */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-800">Current Plan</h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800 capitalize">
                      {profile?.plan} Plan
                    </h3>
                    <p className="text-sm text-gray-600">
                      {profile?.plan === 'starter' 
                        ? `${profile.links_created_this_month}/50 links used this month`
                        : 'Unlimited links'
                      }
                    </p>
                  </div>
                  {profile?.plan === 'starter' && (
                    <Button variant="secondary">
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-800">Security</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Account Security</h3>
                    <p className="text-sm text-gray-600">Manage your account security settings</p>
                  </div>
                  <Button variant="secondary" disabled>
                    <Shield className="w-4 h-4 mr-2" />
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <h2 className="text-lg font-semibold text-red-800">Danger Zone</h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-red-800">Delete Account</h3>
                    <p className="text-sm text-red-600">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="danger" onClick={handleDeleteAccount}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};