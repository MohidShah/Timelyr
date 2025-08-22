import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  Check, 
  X, 
  Edit, 
  Trash2,
  Shield,
  Bell,
  Globe,
  AlertTriangle,
  AlertCircle,
  RefreshCcw,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { 
  getUserProfile, 
  updateUserProfile, 
  checkUsernameAvailability,
  uploadAvatar,
  deleteUserAccount
} from '../../lib/profile';
import { supabase } from '../../lib/supabase';
import { logUserActivity } from '../../lib/activity';
import type { UserProfile } from '../../lib/supabase';

interface ProfileSettingsProps {
  user: any;
  userProfile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  userProfile,
  onProfileUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    display_name: userProfile?.display_name || '',
    username: userProfile?.username || '',
    bio: userProfile?.bio || '',
    phone: userProfile?.phone || '',
    company: userProfile?.company || '',
    job_title: userProfile?.job_title || '',
    website: userProfile?.website || '',
    location: userProfile?.location || '',
    default_timezone: userProfile?.default_timezone || 'UTC',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (userProfile) {
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
      });
    }
  }, [userProfile]);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(passwordData.newPassword));
  }, [passwordData.newPassword]);

  const handleSaveField = async (field: string) => {
    setSaving(true);
    setErrors({});
    setError(null);

    try {
      if (!user) return;

      const updates: Partial<UserProfile> = {};
      
      if (field === 'username' && formData.username !== userProfile?.username) {
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
      onProfileUpdate(updatedProfile);
      setEditingField(null);
      
      // Log activity
      await logUserActivity(user.id, 'profile_updated', { field, value: updates[field as keyof UserProfile] });
      
      // Show success message
      alert(`${field.replace('_', ' ')} updated successfully`);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrors({ [field]: error.message });
      setError(`Failed to update ${field.replace('_', ' ')}. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    setLoading(true);
    setError(null);

    try {
      setSaving(true);
      const avatarUrl = await uploadAvatar(user.id, file);
      const updatedProfile = await updateUserProfile(user.id, { avatar_url: avatarUrl });
      onProfileUpdate(updatedProfile);
      
      // Log activity
      await logUserActivity(user.id, 'avatar_updated', { avatar_url: avatarUrl });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setErrors({ avatar: 'Failed to upload avatar' });
      setError('Error uploading avatar. Please try again.');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      setSaving(true);
      const updatedProfile = await updateUserProfile(user.id, { avatar_url: null });
      onProfileUpdate(updatedProfile);
      
      // Log activity
      await logUserActivity(user.id, 'avatar_removed', {});
    } catch (error) {
      console.error('Error removing avatar:', error);
      setError('Error removing avatar. Please try again.');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!user) return;

    setErrors({});
    setError(null);

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (passwordStrength < 75) {
      setErrors({ newPassword: 'Password is too weak' });
      return;
    }

    try {
      setSaving(true);
      
      // Update password with Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setShowPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Log activity
      await logUserActivity(user.id, 'password_changed', {});
      
      // Show success message
      alert('Password updated successfully');
    } catch (error: any) {
      setErrors({ password: error.message });
      setError(`Failed to update password: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEmailUpdate = async () => {
    if (!user) return;

    setErrors({});
    setError(null);

    try {
      setSaving(true);
      
      // Update email with Supabase Auth
      const { error } = await supabase.auth.updateUser({
        email: emailData.newEmail
      });

      if (error) throw error;

      setShowEmailDialog(false);
      setEmailData({ newEmail: '', password: '' });
      
      // Log activity
      await logUserActivity(user.id, 'email_changed', { new_email: emailData.newEmail });
      
      // Show success message
      alert('Email update initiated. Please check your new email for verification.');
    } catch (error: any) {
      setErrors({ email: error.message });
      setError(`Failed to update email: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await deleteUserAccount(user.id);
      // User will be automatically signed out
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
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
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
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

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  // Error message component
  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
      <AlertCircle className="w-5 h-5 mr-2" />
      <span>{message}</span>
      <button 
        onClick={() => setError(null)}
        className="ml-auto text-red-600 hover:text-red-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} />}
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Profile Information
          </h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                {loading ? (
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                ) : userProfile?.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <label htmlFor="avatar-upload" className={`absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Camera className="w-4 h-4" />
                <input 
                  type="file" 
                  id="avatar-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={loading}
                />
              </label>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{formData.display_name || user?.email?.split('@')[0]}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              {userProfile?.avatar_url && (
                <button 
                  onClick={handleRemoveAvatar}
                  className="text-sm text-red-600 hover:text-red-800 mt-1"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
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
            <User className="w-4 h-4" />
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
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-800">{userProfile?.email}</span>
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => setShowEmailDialog(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Change Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
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
            <User className="w-4 h-4" />
          )}

          {renderEditableField(
            'location',
            'Location',
            formData.location,
            'City, Country',
            'input',
            undefined,
            <Globe className="w-4 h-4" />
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

      {/* Professional Information */}
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
            <User className="w-4 h-4" />
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

      {/* Preferences */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-800">Preferences</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderEditableField(
            'default_timezone',
            'Default Timezone',
            formData.default_timezone,
            undefined,
            'select',
            [
              { value: 'UTC', label: 'UTC' },
              { value: 'America/New_York', label: 'Eastern Time (ET)' },
              { value: 'America/Chicago', label: 'Central Time (CT)' },
              { value: 'America/Denver', label: 'Mountain Time (MT)' },
              { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
              { value: 'Europe/London', label: 'London (GMT/BST)' },
              { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
              { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
              { value: 'Asia/Shanghai', label: 'Beijing (CST)' },
              { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
            ],
            <Globe className="w-4 h-4" />
          )}
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Security
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-800">Password</h3>
              <p className="text-sm text-gray-600">Last updated: Never</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowPasswordDialog(true)}
            >
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <h2 className="text-xl font-semibold text-red-600 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Danger Zone
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <h3 className="font-medium text-red-800">Delete Account</h3>
              <p className="text-sm text-red-600">
                Permanently delete your account and all associated data. This action cannot be undone.
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

      {/* Password Change Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => setShowPasswordDialog(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                error={errors.newPassword}
              />
              
              {passwordData.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Password strength:</span>
                    <span className={`font-medium ${
                      passwordStrength < 50 ? 'text-red-600' : 
                      passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
              />

              <div className="flex space-x-3">
                <Button
                  onClick={handlePasswordUpdate}
                  loading={saving}
                  disabled={passwordStrength < 75 || passwordData.newPassword !== passwordData.confirmPassword}
                  className="flex-1"
                >
                  Update Password
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowPasswordDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email Change Dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Change Email</h2>
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => setShowEmailDialog(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  You'll need to verify your new email address before the change takes effect.
                </p>
              </div>

              <Input
                label="New Email Address"
                type="email"
                value={emailData.newEmail}
                onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                error={errors.email}
              />

              <div className="flex space-x-3">
                <Button
                  onClick={handleEmailUpdate}
                  loading={saving}
                  disabled={!emailData.newEmail}
                  className="flex-1"
                >
                  Update Email
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowEmailDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Account Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This will permanently delete all your data including links, analytics, and profile information. This action cannot be undone."
        confirmText="Delete Account"
        variant="danger"
      />
    </div>
  );
};