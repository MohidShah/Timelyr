import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Trash2, 
  Camera, 
  Save, 
  Check, 
  X, 
  Edit, 
  Crown, 
  Mail, 
  Globe, 
  Clock,
  Phone,
  Building,
  MapPin,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Settings,
  Activity,
  Bell,
  Palette,
  Accessibility
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { 
  getUserProfile, 
  updateUserProfile, 
  checkUsernameAvailability,
  generateUsernameSuggestions,
  uploadAvatar,
  deleteUserAccount,
  createUserProfile
} from '../../lib/profile';
import { 
  getUserPreferences,
  updateUserPreferences,
  updateTheme,
  updateAccessibilitySettings,
  applyPreferencesToDOM
} from '../../lib/preferences';
import { getUserActivityHistory, getActivitySummary, logUserActivity } from '../../lib/activity';
import { getNotificationPreferences, updateNotificationPreferences } from '../../lib/notifications';
import { supabase } from '../../lib/supabase';
import type { UserProfile } from '../../lib/supabase';

export const EnhancedProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'activity' | 'notifications'>('profile');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    bio: '',
    phone: '',
    company: '',
    job_title: '',
    website: '',
    location: '',
    default_timezone: 'UTC',
    profile_visibility: 'public' as const
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activitySummary, setActivitySummary] = useState<any>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);
      
      // Fetch or create user profile
      let userProfile = await getUserProfile(user.id);
      if (!userProfile) {
        userProfile = await createUserProfile(user.id, {
          email: user.email!,
          display_name: user.user_metadata?.full_name || user.email!.split('@')[0],
        });
      }
      
      setProfile(userProfile);
      
      // Fetch preferences
      let userPreferences = await getUserPreferences(user.id);
      if (!userPreferences) {
        // Create default preferences if none exist
        userPreferences = await updateUserPreferences(user.id, {
          notification_email: true,
          notification_browser: true,
          marketing_emails: false,
          weekly_digest: true,
          theme: 'light' as const,
          language: 'en',
          dashboard_layout: {
            sidebar_collapsed: false,
            default_view: 'grid',
            items_per_page: 12,
            show_analytics_widget: true,
            show_business_hours_widget: true
          },
          reduce_motion: false,
          high_contrast: false,
          large_text: false,
          pwa_installed: false
        });
      }
      setPreferences(userPreferences);
      
      // Apply preferences to DOM
      if (userPreferences) {
        applyPreferencesToDOM(userPreferences);
      }
      
      // Fetch activity summary
      const summary = await getActivitySummary(user.id);
      setActivitySummary(summary);
      
      // Set form data
      setFormData({
        display_name: userProfile.display_name,
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        phone: userProfile.phone || '',
        company: userProfile.company || '',
        job_title: userProfile.job_title || '',
        website: userProfile.website || '',
        location: userProfile.location || '',
        default_timezone: userProfile.default_timezone,
        profile_visibility: userProfile.profile_visibility
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
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
      } else {
        updates[field as keyof UserProfile] = formData[field as keyof typeof formData] as any;
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
      
      // Log activity
      await logUserActivity(user.id, 'avatar_updated', { avatar_url: avatarUrl });
      
      // Show success message
      alert('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleRemoveAvatar = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const updatedProfile = await updateUserProfile(user.id, { avatar_url: null });
      setProfile(updatedProfile);
      
      // Log activity
      await logUserActivity(user.id, 'avatar_removed', {});
      
      // Show success message
      alert('Profile picture removed successfully');
    } catch (error) {
      console.error('Error removing avatar:', error);
      alert('Failed to remove profile picture. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleUpdatePreferences = async (updates: Partial<any>) => {
    if (!user) return;
    
    try {
      setSaving(true);
      const updatedPreferences = await updateUserPreferences(user.id, updates);
      setPreferences(updatedPreferences);
      
      // Apply preferences to DOM
      applyPreferencesToDOM(updatedPreferences);
      
      // Log activity
      await logUserActivity(user.id, 'preferences_updated', { updates });
      
      // Show success message
      alert('Preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Failed to update preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleUpdateAccessibility = async (updates: Partial<any>) => {
    if (!user) return;
    
    try {
      setSaving(true);
      const updatedSettings = await updateAccessibilitySettings(user.id, updates);
      setPreferences(prev => ({ ...prev, ...updatedSettings }));
      
      // Apply settings to DOM
      applyPreferencesToDOM({ ...preferences, ...updatedSettings });
      
      // Log activity
      await logUserActivity(user.id, 'accessibility_updated', { updates });
      
      // Show success message
      alert('Accessibility settings updated successfully');
    } catch (error) {
      console.error('Error updating accessibility settings:', error);
      alert('Failed to update accessibility settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleUpdateTheme = async (theme: 'light' | 'dark' | 'system') => {
    if (!user) return;
    
    try {
      setSaving(true);
      const updatedTheme = await updateTheme(user.id, theme);
      setPreferences(prev => ({ ...prev, theme: updatedTheme }));
      
      // Apply theme to DOM
      applyPreferencesToDOM({ ...preferences, theme: updatedTheme });
      
      // Log activity
      await logUserActivity(user.id, 'theme_updated', { theme: updatedTheme });
      
      // Show success message
      alert(`Theme updated to ${theme} mode`);
    } catch (error) {
      console.error('Error updating theme:', error);
      alert('Failed to update theme. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'auto') => {
    if (!user) return;
    
    try {
      await updateTheme(user.id, theme);
      setPreferences((prev: any) => ({ ...prev, theme }));
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const handleAccessibilityChange = async (setting: string, value: boolean) => {
    if (!user) return;
    
    try {
      await updateAccessibilitySettings(user.id, { [setting]: value });
      setPreferences((prev: any) => ({ ...prev, [setting]: value }));
    } catch (error) {
      console.error('Error updating accessibility settings:', error);
    }
  };

  const renderEditableField = (
    field: string, 
    label: string, 
    value: string, 
    placeholder?: string,
    type: 'input' | 'textarea' | 'select' = 'input',
    options?: { value: string; label: string }[],
    icon?: React.ReactNode
  ) => {
    const isEditing = editingField === field;
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </label>
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
                type={field === 'email' ? 'email' : field === 'website' ? 'url' : field === 'phone' ? 'tel' : 'text'}
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
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
      </div>
    );
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

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
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your account information, preferences, and security settings</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-blue-700' : 'text-gray-400'}`} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Quick Profile Card */}
            <Card className="mt-6">
              <CardContent className="p-4 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Avatar" 
                        className="w-20 h-20 object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-blue-600" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                    <Camera className="w-3 h-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <h3 className="font-semibold text-gray-800">{profile?.display_name}</h3>
                <p className="text-sm text-gray-500">@{profile?.username || 'username'}</p>
                <div className="flex items-center justify-center mt-2">
                  {profile?.plan === 'pro' && (
                    <div className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      <Crown className="w-3 h-3 mr-1" />
                      Pro
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {renderEditableField(
                      'display_name',
                      'Display Name',
                      formData.display_name,
                      'Enter your display name',
                      'input',
                      undefined,
                      <User className="w-4 h-4" />
                    )}

                    {renderEditableField(
                      'username',
                      'Username',
                      formData.username,
                      'Choose a unique username',
                      'input',
                      undefined,
                      <LinkIcon className="w-4 h-4" />
                    )}

                    {renderEditableField(
                      'bio',
                      'Bio',
                      formData.bio,
                      'Tell us about yourself...',
                      'textarea',
                      undefined,
                      <Edit className="w-4 h-4" />
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
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

                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {renderEditableField(
                      'phone',
                      'Phone Number',
                      formData.phone,
                      '+1 (555) 123-4567',
                      'input',
                      undefined,
                      <Phone className="w-4 h-4" />
                    )}

                    {renderEditableField(
                      'location',
                      'Location',
                      formData.location,
                      'City, Country',
                      'input',
                      undefined,
                      <MapPin className="w-4 h-4" />
                    )}

                    {renderEditableField(
                      'website',
                      'Website',
                      formData.website,
                      'https://yourwebsite.com',
                      'input',
                      undefined,
                      <Globe className="w-4 h-4" />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-800">Professional Information</h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {renderEditableField(
                      'company',
                      'Company',
                      formData.company,
                      'Your company name',
                      'input',
                      undefined,
                      <Building className="w-4 h-4" />
                    )}

                    {renderEditableField(
                      'job_title',
                      'Job Title',
                      formData.job_title,
                      'Your job title',
                      'input',
                      undefined,
                      <User className="w-4 h-4" />
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <Palette className="w-5 h-5 mr-2" />
                      Appearance
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'light', label: 'Light', icon: '☀️' },
                          { value: 'dark', label: 'Dark', icon: '🌙' },
                          { value: 'auto', label: 'Auto', icon: '🔄' }
                        ].map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => handleUpdateTheme(theme.value as any)}
                            className={`p-4 border-2 rounded-lg text-center transition-colors ${
                              preferences?.theme === theme.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-2">{theme.icon}</div>
                            <div className="text-sm font-medium">{theme.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <Accessibility className="w-5 h-5 mr-2" />
                      Accessibility
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        key: 'reduce_motion',
                        label: 'Reduce Motion',
                        description: 'Minimize animations and transitions'
                      },
                      {
                        key: 'high_contrast',
                        label: 'High Contrast',
                        description: 'Increase contrast for better visibility'
                      },
                      {
                        key: 'large_text',
                        label: 'Large Text',
                        description: 'Increase text size throughout the app'
                      }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-800">{setting.label}</h4>
                          <p className="text-sm text-gray-600">{setting.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences?.[setting.key] || false}
                            onChange={(e) => handleUpdateAccessibility({ [setting.key]: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <Lock className="w-5 h-5 mr-2" />
                      Password & Security
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-3">Change Password</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        It's a good idea to use a strong password that you don't use elsewhere
                      </p>
                      <Button 
                        variant="outline" 
                        className="flex items-center" 
                        onClick={() => setShowPasswordDialog(true)}
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-3">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add an extra layer of security to your account
                      </p>
                      <Button 
                        variant="outline" 
                        className="flex items-center"
                        onClick={() => alert('Two-factor authentication setup will be available soon')}
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Setup 2FA
                      </Button>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-3">Active Sessions</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Manage devices where you're currently logged in
                      </p>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                          <div className="flex items-center">
                            <Monitor className="w-5 h-5 text-gray-500 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">Current Device</p>
                              <p className="text-xs text-gray-500">Last active: Just now</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-green-600 bg-green-50">Current</Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-md font-medium text-gray-800 mb-3">Account Deletion</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Permanently delete your account and all of your content
                      </p>
                      <Button 
                        variant="destructive" 
                        className="flex items-center"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Notification Preferences
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {[
                        {
                          key: 'email_notifications',
                          label: 'Email Notifications',
                          description: 'Receive notifications via email'
                        },
                        {
                          key: 'browser_notifications',
                          label: 'Browser Notifications',
                          description: 'Receive notifications in your browser'
                        },
                        {
                          key: 'marketing_emails',
                          label: 'Marketing Emails',
                          description: 'Receive marketing and promotional emails'
                        },
                        {
                          key: 'weekly_digest',
                          label: 'Weekly Digest',
                          description: 'Receive a weekly summary of your account activity'
                        },
                        {
                          key: 'link_expiring_notifications',
                          label: 'Link Expiring Notifications',
                          description: 'Get notified when your links are about to expire'
                        },
                        {
                          key: 'usage_limit_notifications',
                          label: 'Usage Limit Notifications',
                          description: 'Get notified when you approach your usage limits'
                        },
                        {
                          key: 'security_alerts',
                          label: 'Security Alerts',
                          description: 'Get notified about important security events'
                        },
                        {
                          key: 'feature_announcements',
                          label: 'Feature Announcements',
                          description: 'Get notified about new features and updates'
                        }
                      ].map((notification) => (
                        <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-800">{notification.label}</h4>
                            <p className="text-sm text-gray-600">{notification.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences?.[notification.key] || false}
                              onChange={(e) => handleUpdatePreferences({ [notification.key]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'activity' && activitySummary && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-800">Activity Summary</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{activitySummary.totalActivities}</div>
                        <div className="text-sm text-gray-600">Total Activities</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {activitySummary.mostActiveDay ? new Date(activitySummary.mostActiveDay).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Most Active Day</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {activitySummary.mostCommonAction?.replace('_', ' ') || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Most Common Action</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {Object.keys(activitySummary.activityByType).length}
                        </div>
                        <div className="text-sm text-gray-600">Activity Types</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-800 mb-3">Activity Breakdown</h3>
                      <div className="space-y-2">
                        {Object.entries(activitySummary.activityByType).map(([action, count]) => (
                          <div key={action} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700 capitalize">
                              {action.replace('_', ' ')}
                            </span>
                            <span className="text-sm font-medium text-gray-900">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};