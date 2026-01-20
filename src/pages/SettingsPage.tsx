import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser, useUpdateUser } from '@/hooks/useUsers';
import { useChangePassword } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@/components/ui';
import {
  MdPerson,
  MdLock,
  MdSettings,
  MdSecurity,
  MdNotifications,
  MdBusiness,
  MdPalette,
  MdLanguage,
  MdComputer,
} from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

type SettingsTab = 'profile' | 'preferences' | 'clinic' | 'system' | 'security';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Fetch current user data
  const { data: userData } = useUser(user?.employee_id || '', {
    enabled: !!user?.employee_id,
  });

  const updateUserMutation = useUpdateUser();
  const changePasswordMutation = useChangePassword();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Update form when user data loads
  useEffect(() => {
    if (userData) {
      profileForm.reset({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
      });
    }
  }, [userData, profileForm]);

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const isSystemAdmin = user?.user_type === 'SYSTEM' || user?.role === 'ADMIN';
  const isClinicAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setProfileError(null);

    if (!user?.employee_id) {
      setProfileError('User ID not found');
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        id: user.employee_id,
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          // Email is not editable, so don't include it in the update
          phone: data.phone,
        },
      });
      // Success - form will update via useUser query
    } catch (error) {
      if (error instanceof Error) {
        setProfileError(error.message);
      } else {
        setProfileError('Failed to update profile. Please try again.');
      }
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      await changePasswordMutation.mutateAsync({
        current_password: data.current_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });
      setPasswordSuccess(true);
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (error) {
      if (error instanceof Error) {
        setPasswordError(error.message);
      } else {
        setPasswordError('Failed to change password. Please try again.');
      }
    }
  };

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: MdPerson },
    { id: 'preferences' as SettingsTab, label: 'Preferences', icon: MdPalette },
    ...(isClinicAdmin ? [{ id: 'clinic' as SettingsTab, label: 'Clinic Settings', icon: MdBusiness }] : []),
    ...(isSystemAdmin ? [{ id: 'system' as SettingsTab, label: 'System Settings', icon: MdSettings }] : []),
    { id: 'security' as SettingsTab, label: 'Security', icon: MdSecurity },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold text-azure-dragon mb-1">Settings</h1>
        <p className="text-sm text-carbon/60">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card variant="elevated">
            <CardContent className="p-0">
              <nav className="space-y-1 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'bg-azure-dragon/10 text-azure-dragon font-medium'
                          : 'text-carbon/70 hover:bg-white-smoke'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MdPerson className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                    {profileError && (
                      <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
                        <p className="text-xs text-smudged-lips">{profileError}</p>
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="First Name"
                        {...profileForm.register('first_name')}
                        error={profileForm.formState.errors.first_name?.message}
                      />
                      <Input
                        label="Last Name"
                        {...profileForm.register('last_name')}
                        error={profileForm.formState.errors.last_name?.message}
                      />
                      <Input
                        label="Email"
                        type="email"
                        {...profileForm.register('email')}
                        error={profileForm.formState.errors.email?.message}
                        disabled
                        helperText="Email cannot be changed"
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        {...profileForm.register('phone')}
                        error={profileForm.formState.errors.phone?.message}
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-carbon/10">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        disabled={profileForm.formState.isSubmitting}
                      >
                        {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MdLock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                    {passwordError && (
                      <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
                        <p className="text-xs text-smudged-lips">{passwordError}</p>
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="rounded-md bg-bright-halo/10 border border-bright-halo/25 px-3.5 py-2.5">
                        <p className="text-xs text-azure-dragon">Password changed successfully!</p>
                      </div>
                    )}

                    <Input
                      label="Current Password"
                      type="password"
                      {...passwordForm.register('current_password')}
                      error={passwordForm.formState.errors.current_password?.message}
                    />
                    <Input
                      label="New Password"
                      type="password"
                      {...passwordForm.register('new_password')}
                      error={passwordForm.formState.errors.new_password?.message}
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      {...passwordForm.register('confirm_password')}
                      error={passwordForm.formState.errors.confirm_password?.message}
                    />

                    <div className="flex gap-3 pt-4 border-t border-carbon/10">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-1">Username</label>
                      <p className="text-sm text-carbon">{userData?.username || user?.username || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-1">Role</label>
                      <p className="text-sm text-carbon capitalize">{user?.role || user?.user_type || '—'}</p>
                    </div>
                    {userData?.clinic_id && (
                      <div>
                        <label className="block text-xs font-medium text-carbon/60 mb-1">Clinic ID</label>
                        <p className="text-xs text-carbon font-mono">{userData.clinic_id}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-1">Account Status</label>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          userData?.is_active
                            ? 'bg-bright-halo/20 text-azure-dragon'
                            : 'bg-carbon/10 text-carbon/60'
                        }`}
                      >
                        {userData?.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MdPalette className="h-5 w-5" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-2">Theme</label>
                      <Select
                        value="light"
                        onChange={() => {}}
                        options={[
                          { value: 'light', label: 'Light' },
                          { value: 'dark', label: 'Dark' },
                          { value: 'system', label: 'System' },
                        ]}
                      />
                      <p className="text-xs text-carbon/50 mt-1.5">Choose your preferred color theme</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MdLanguage className="h-5 w-5" />
                    Language & Locale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-2">Language</label>
                      <Select
                        value="en"
                        onChange={() => {}}
                        options={[
                          { value: 'en', label: 'English' },
                          { value: 'fr', label: 'French' },
                          { value: 'es', label: 'Spanish' },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-2">Date Format</label>
                      <Select
                        value="MM/DD/YYYY"
                        onChange={() => {}}
                        options={[
                          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-2">Time Format</label>
                      <Select
                        value="12h"
                        onChange={() => {}}
                        options={[
                          { value: '12h', label: '12 Hour' },
                          { value: '24h', label: '24 Hour' },
                        ]}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MdNotifications className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-carbon">Email Notifications</label>
                        <p className="text-xs text-carbon/60">Receive notifications via email</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-carbon">SMS Notifications</label>
                        <p className="text-xs text-carbon/60">Receive notifications via SMS</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-carbon">In-App Notifications</label>
                        <p className="text-xs text-carbon/60">Show notifications in the app</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4" defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Clinic Settings Tab */}
          {activeTab === 'clinic' && isClinicAdmin && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MdBusiness className="h-5 w-5" />
                  Clinic Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-carbon/60">
                  Clinic-specific settings will be available here. This section is for clinic administrators to
                  manage clinic preferences and configurations.
                </p>
                {/* TODO: Implement clinic settings */}
              </CardContent>
            </Card>
          )}

          {/* System Settings Tab */}
          {activeTab === 'system' && isSystemAdmin && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MdSettings className="h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-carbon/60">
                  System-wide settings and configurations. This section is only accessible to system administrators.
                </p>
                {/* TODO: Implement system settings */}
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MdComputer className="h-5 w-5" />
                    Active Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white-smoke rounded-md">
                      <div>
                        <p className="text-sm font-medium text-carbon">Current Session</p>
                        <p className="text-xs text-carbon/60">This device • Now</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-azure-dragon/20 text-azure-dragon rounded">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-carbon/50">
                      You can view and manage your active sessions here. Logging out from other devices will
                      invalidate their sessions.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Login History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-carbon/60">
                    Recent login history will be displayed here. This helps you monitor account access and detect
                    any unauthorized activity.
                  </p>
                  {/* TODO: Implement login history */}
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MdSecurity className="h-5 w-5" />
                    Two-Factor Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-carbon">Enable 2FA</label>
                        <p className="text-xs text-carbon/60">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <input type="checkbox" className="h-4 w-4" />
                    </div>
                    <p className="text-xs text-carbon/50">
                      Two-factor authentication is not yet available. This feature will be implemented in a future
                      update.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
