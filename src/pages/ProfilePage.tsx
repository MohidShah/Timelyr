import React, { useState, useEffect } from 'react';
import { User, Shield, Trash2, Camera, Save, Check, X, Edit } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { 
  getUserProfile, 
  updateUserProfile, 
  checkUsernameAvailability,
  generateUsernameSuggestions,
  uploadAvatar,
  deleteUserAccount
} from '../lib/profile';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../lib/supabase';

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    bio: '',
    default_timezone: 'UTC',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);
      
      let userProfile = await getUserProfile(user.id);
      
      if (!userProfile) {
        // Create profile if it doesn't exist
        userProfile = await createUserProfile(user.id, {
          email: user.email!,
          display_name: user.user_metadata?.full_name || user.email!.split('@')[0],
        });
      }
      
      setProfile(userProfile);
      setFormData({
        display_name: userProfile.display_name,
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        default_timezone: userProfile.default_timezone,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveField = async (field: string) => {
    setSaving(true);
    setErrors({});

    try {
      if (!user) return;

      const updates: Partial<UserProfile> = {};
      
      if (field === 'username' && formData.username !== profile?.username) {
        if (formData.username) {
          const { available, error } = await checkUsernameAvailability(formData.username, user.id);
          if (!available) {
            setErrors({ username: error || 'Username not available' });
            return;
          }
        }
        updates.username = formData.username || null;
      } else if (field === 'display_name') {
        updates.display_name = formData.display_name;
      } else if (field === 'bio') {
        updates.bio = formData.bio || null;
      } else if (field === 'default_timezone') {
        updates.default_timezone = formData.default_timezone;
      }

      const updatedProfile = await updateUserProfile(user.id, updates);
      setProfile(updatedProfile);
      setEditingField(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrors({ [field]: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setSaving(true);
      const avatarUrl = await uploadAvatar(user.id, file);
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateUsernames = async () => {
    if (!formData.display_name) return;
    
    try {
      const suggestions = await generateUsernameSuggestions(formData.display_name);
      setUsernameSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating usernames:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      await deleteUserAccount(user.id);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const renderEditableField = (
    field: string, 
    label: string, 
    value: string, 
    placeholder?: string,
    type: 'input' | 'textarea' | 'select' = 'input',
    options?: { value: string; label: string }[]
  ) => {
    const isEditing = editingField === field;
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {isEditing ? (
          <div className="flex items-center space-x-2">
            {type === 'textarea' ? (
              <textarea
                value={formData[field as keyof typeof formData]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                placeholder={placeholder}
                rows={3}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : type === 'select' ? (
              <select
                value={formData[field as keyof typeof formData]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {options?.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData[field as keyof typeof formData]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <Button
              size="sm"
              onClick={() => handleSaveField(field)}
              loading={saving}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => {
                setEditingField(null);
                setErrors({});
                // Reset form data
                if (profile) {
                  setFormData({
                    display_name: profile.display_name,
                    username: profile.username || '',
                    bio: profile.bio || '',
                    default_timezone: profile.default_timezone,
                  });
                }
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-800">
              {value || <span className="text-gray-400 italic">Not set</span>}
            </span>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setEditingField(field)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        )}
        {errors[field] && (
          <p className="text-sm text-red-600">{errors[field]}</p>
        )}
        {field === 'username' && isEditing && usernameSuggestions.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {usernameSuggestions.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setFormData({ ...formData, username: suggestion })}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Beijing (CST)' },
    { value: 'Asia/Karachi', label: 'Islamabad (PKT)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  };

  return (
    <>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
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
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Avatar" 
                        className="w-24 h-24 object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-blue-600" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Click the camera icon to upload a new profile picture
                </p>
              </CardContent>
            </Card>

            {/* Account Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-800">Account Information</h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  {renderEditableField(
                    'display_name',
                    'Display Name',
                    formData.display_name,
                    'Enter your display name'
                  )}

                  <div>
                    {renderEditableField(
                      'username',
                      'Username',
                      formData.username,
                      'Choose a unique username'
                    )}
                    {editingField === 'username' && (
                      <div className="mt-2">
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={handleGenerateUsernames}
                        >
                          Generate Suggestions
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">
                          Used for custom URLs: timelyr.com/@{formData.username || 'username'}/link-name
                        </p>
                      </div>
                    )}
                  </div>

                  {renderEditableField(
                    'bio',
                    'Bio',
                    formData.bio,
                    'Tell us about yourself...',
                    'textarea'
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-800">{profile?.email}</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-800">Preferences</h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  {renderEditableField(
                    'default_timezone',
                    'Default Timezone',
                    timezoneOptions.find(opt => opt.value === formData.default_timezone)?.label || formData.default_timezone,
                    undefined,
                    'select',
                    timezoneOptions
                  )}
                </CardContent>
              </Card>

              {/* Plan Information */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-800">Current Plan</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-800 capitalize">
                        {profile?.plan} Plan
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {profile?.plan === 'starter' 
                          ? `${profile.links_created_this_month}/50 links used this month`
                          : 'Unlimited links'
                        }
                      </p>
                      {profile?.plan === 'starter' && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2">Starter Plan Limits</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• 50 links per month</li>
                            <li>• 30-day link expiration</li>
                            <li>• Basic analytics</li>
                            <li>• Community support</li>
                          </ul>
                        </div>
                      )}
                      {profile?.plan === 'pro' && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-medium text-purple-800 mb-2">Pro Plan Benefits</h4>
                          <ul className="text-sm text-purple-700 space-y-1">
                            <li>• Unlimited links</li>
                            <li>• 1-year link expiration</li>
                            <li>• Advanced analytics</li>
                            <li>• Priority support</li>
                            <li>• Custom branding</li>
                          </ul>
                        </div>
                      )}
                    </div>
                    {profile?.plan === 'starter' && (
                      <div className="flex space-x-3">
                        <Button variant="primary">
                          Upgrade to Pro
                        </Button>
                        <Button variant="tertiary">
                          Compare Plans
                        </Button>
                      </div>
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
                      <h3 className="font-medium text-gray-800">Password</h3>
                      <p className="text-sm text-gray-600">Change your account password</p>
                    </div>
                    <Button variant="secondary" disabled>
                      <Shield className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <Button variant="secondary" disabled>
                      <Shield className="w-4 h-4 mr-2" />
                      Enable 2FA
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
                    <Button 
                      variant="danger" 
                      onClick={() => setShowDeleteDialog(true)}
                    >
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

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This will permanently delete all your data, including links and analytics. This action cannot be undone."
        confirmText="Delete Account"
        variant="danger"
      />
    </>
  );
};