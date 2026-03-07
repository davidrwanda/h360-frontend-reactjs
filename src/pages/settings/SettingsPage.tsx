import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser, useUpdateUser, useMyPreferences, useUpdateMyPreferences } from '@/hooks/useUsers';
import { useUpdatePatient } from '@/hooks/usePatients';
import { useChangePassword } from '@/hooks/useAuth';
import { useClinic } from '@/hooks/useClinics';
import { useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '@/store/toastStore';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@/components/ui';
import { useI18nStore, useTranslation, SETTINGS, SUPPORTED_LANGS } from '@/i18n';
import type { SupportedLang } from '@/i18n';
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

const preferencesSchema = z.object({
  theme: z.string().optional(),
  language: z.string().optional(),
  date_format: z.string().optional(),
  time_format: z.string().optional(),
  email_notifications: z.boolean().optional(),
  sms_notifications: z.boolean().optional(),
  in_app_notifications: z.boolean().optional(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

type SettingsTab = 'profile' | 'preferences' | 'clinic' | 'system' | 'security';

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Reactive Zod schemas for translated validation messages
  const profileSchema = useMemo(
    () =>
      z.object({
        first_name: z.string().min(1, t(SETTINGS.FIRST_NAME_REQUIRED)),
        last_name: z.string().min(1, t(SETTINGS.LAST_NAME_REQUIRED)),
        email: z.string().email(t(SETTINGS.INVALID_EMAIL)),
        phone: z.string().optional(),
      }),
    [t],
  );

  const passwordSchema = useMemo(
    () =>
      z
        .object({
          current_password: z.string().min(1, t(SETTINGS.CURRENT_PASSWORD_REQUIRED)),
          new_password: z
            .string()
            .min(8, t(SETTINGS.PASSWORD_MIN_LENGTH))
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t(SETTINGS.PASSWORD_COMPLEXITY)),
          confirm_password: z.string(),
        })
        .refine((data) => data.new_password === data.confirm_password, {
          message: t(SETTINGS.PASSWORDS_DONT_MATCH),
          path: ['confirm_password'],
        }),
    [t],
  );

  type ProfileFormData = z.infer<typeof profileSchema>;
  type PasswordFormData = z.infer<typeof passwordSchema>;

  // Fetch current user data (only for EMPLOYEE/SYSTEM users, not PATIENT)
  const { data: userData } = useUser(user?.user_id || '', {
    enabled: !!user?.user_id && user?.user_type !== 'PATIENT',
  });

  // Fetch clinic data to get clinic_code
  const clinicId = userData?.clinic_id || (user?.clinic_id ? user.clinic_id : undefined);
  const { data: clinicData } = useClinic(clinicId);

  const queryClient = useQueryClient();
  const updateUserMutation = useUpdateUser();
  const updatePatientMutation = useUpdatePatient();
  const changePasswordMutation = useChangePassword();
  const { success: showSuccess, error: showError } = useToastStore();

  // Fetch preferences
  const { data: preferencesData } = useMyPreferences();
  const updatePreferencesMutation = useUpdateMyPreferences();
  const setLang = useI18nStore((s) => s.setLang);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
  });

  const preferencesForm = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
  });

  // Update form when user data loads
  useEffect(() => {
    // For PATIENT users, use patient data from /api/auth/me
    if (user?.user_type === 'PATIENT' && user?.patient) {
      const patientData = user.patient;
      profileForm.reset({
        first_name: patientData.first_name || '',
        last_name: patientData.last_name || '',
        email: user.email || '',
        phone: patientData.phone || '',
      }, { keepDefaultValues: false });
    } else if (userData && user?.user_type !== 'PATIENT') {
      // For EMPLOYEE/SYSTEM users, use userData from /api/users/:id
      profileForm.reset({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
      }, { keepDefaultValues: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, user?.user_type, user?.patient, user?.email]);

  // Update preferences form when preferences data loads
  useEffect(() => {
    if (preferencesData) {
      // Map time_format from API format ("12 Hour"/"24 Hour") to form format ("12h"/"24h")
      const timeFormatValue =
        preferencesData.time_format === '24 Hour'
          ? '24h'
          : preferencesData.time_format === '12 Hour'
            ? '12h'
            : preferencesData.time_format || '12h';

      preferencesForm.reset({
        theme: preferencesData.theme || 'Light',
        language: preferencesData.language || 'en',
        date_format: preferencesData.date_format || 'MM/DD/YYYY',
        time_format: timeFormatValue,
        email_notifications: preferencesData.email_notifications ?? true,
        sms_notifications: preferencesData.sms_notifications ?? false,
        in_app_notifications: preferencesData.in_app_notifications ?? true,
      });
    }
  }, [preferencesData, preferencesForm]);

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const isSystemAdmin = user?.user_type === 'SYSTEM' || user?.role === 'ADMIN';
  const isClinicAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  // Hide Personal Information and Change Password for SYSTEM users with ALL permissions
  const isSystemUserWithAllPermissions = user?.user_type === 'SYSTEM' && user?.permissions === 'ALL';

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setProfileError(null);

    if (!user?.user_id) {
      setProfileError(t(SETTINGS.USER_ID_NOT_FOUND));
      return;
    }

    try {
      // For PATIENT users, update via patient API
      if (user?.user_type === 'PATIENT' && user?.patient?.patient_id) {
        await updatePatientMutation.mutateAsync({
          id: user.patient.patient_id,
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone || undefined,
          },
        });
        // Invalidate auth query to refresh user data
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      } else {
        // For EMPLOYEE/SYSTEM users, update via user API
        await updateUserMutation.mutateAsync({
          id: user.user_id,
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            // Email is not editable, so don't include it in the update
            phone: data.phone,
          },
        });
      }
      showSuccess(t(SETTINGS.PROFILE_UPDATED));
      // Success - form will update via useUser query or auth query
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t(SETTINGS.PROFILE_UPDATE_FAILED);
      setProfileError(errorMessage);
      showError(errorMessage);
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
      showSuccess(t(SETTINGS.PASSWORD_CHANGED));
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t(SETTINGS.PASSWORD_CHANGE_FAILED);
      setPasswordError(errorMessage);
      showError(errorMessage);
    }
  };

  const handlePreferencesSubmit = async (data: PreferencesFormData) => {
    try {
      await updatePreferencesMutation.mutateAsync({
        theme: data.theme,
        language: data.language,
        date_format: data.date_format,
        time_format: data.time_format === '12h' ? '12 Hour' : data.time_format === '24h' ? '24 Hour' : data.time_format,
        email_notifications: data.email_notifications,
        sms_notifications: data.sms_notifications,
        in_app_notifications: data.in_app_notifications,
      });

      // Sync language to i18n store so UI updates immediately
      if (data.language && SUPPORTED_LANGS.includes(data.language as SupportedLang)) {
        setLang(data.language as SupportedLang);
      }

      showSuccess(t(SETTINGS.PREFS_UPDATED));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t(SETTINGS.PREFS_UPDATE_FAILED);
      showError(errorMessage);
    }
  };

  const tabs = [
    { id: 'profile' as SettingsTab, label: t(SETTINGS.TAB_PROFILE), icon: MdPerson },
    { id: 'preferences' as SettingsTab, label: t(SETTINGS.TAB_PREFERENCES), icon: MdPalette },
    ...(isClinicAdmin ? [{ id: 'clinic' as SettingsTab, label: t(SETTINGS.TAB_CLINIC), icon: MdBusiness }] : []),
    ...(isSystemAdmin ? [{ id: 'system' as SettingsTab, label: t(SETTINGS.TAB_SYSTEM), icon: MdSettings }] : []),
    { id: 'security' as SettingsTab, label: t(SETTINGS.TAB_SECURITY), icon: MdSecurity },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold text-azure-dragon mb-1">{t(SETTINGS.PAGE_TITLE)}</h1>
        <p className="text-sm text-carbon/60">{t(SETTINGS.PAGE_SUBTITLE)}</p>
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
              {/* Hide Personal Information for SYSTEM users with ALL permissions */}
              {!isSystemUserWithAllPermissions && (
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MdPerson className="h-5 w-5" />
                      {t(SETTINGS.PERSONAL_INFO)}
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
                          label={t(SETTINGS.FIRST_NAME)}
                          {...profileForm.register('first_name')}
                          error={profileForm.formState.errors.first_name?.message}
                        />
                        <Input
                          label={t(SETTINGS.LAST_NAME)}
                          {...profileForm.register('last_name')}
                          error={profileForm.formState.errors.last_name?.message}
                        />
                        <Input
                          label={t(SETTINGS.EMAIL)}
                          type="email"
                          {...profileForm.register('email')}
                          error={profileForm.formState.errors.email?.message}
                          disabled
                          helperText={t(SETTINGS.EMAIL_CANNOT_CHANGE)}
                        />
                        <Input
                          label={t(SETTINGS.PHONE)}
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
                          {profileForm.formState.isSubmitting ? t(SETTINGS.SAVING) : t(SETTINGS.SAVE_CHANGES)}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Hide Change Password for SYSTEM users with ALL permissions */}
              {!isSystemUserWithAllPermissions && (
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MdLock className="h-5 w-5" />
                      {t(SETTINGS.CHANGE_PASSWORD)}
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
                          <p className="text-xs text-azure-dragon">{t(SETTINGS.PASSWORD_CHANGED)}</p>
                        </div>
                      )}

                      <Input
                        label={t(SETTINGS.CURRENT_PASSWORD)}
                        type="password"
                        {...passwordForm.register('current_password')}
                        error={passwordForm.formState.errors.current_password?.message}
                      />
                      <Input
                        label={t(SETTINGS.NEW_PASSWORD)}
                        type="password"
                        {...passwordForm.register('new_password')}
                        error={passwordForm.formState.errors.new_password?.message}
                      />
                      <Input
                        label={t(SETTINGS.CONFIRM_NEW_PASSWORD)}
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
                          {changePasswordMutation.isPending ? t(SETTINGS.CHANGING) : t(SETTINGS.CHANGE_PASSWORD)}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>{t(SETTINGS.ACCOUNT_INFO)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-1">{t(SETTINGS.USERNAME)}</label>
                      <p className="text-sm text-carbon">{userData?.username || user?.username || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-1">{t(SETTINGS.ROLE)}</label>
                      <p className="text-sm text-carbon capitalize">{user?.role || user?.user_type || '—'}</p>
                    </div>
                    {(userData?.clinic_id || user?.clinic_id) && (
                      <div>
                        <label className="block text-xs font-medium text-carbon/60 mb-1">{t(SETTINGS.CLINIC_CODE)}</label>
                        <p className="text-sm text-carbon font-medium">
                          {clinicData?.clinic_code || '—'}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-1">{t(SETTINGS.ACCOUNT_STATUS)}</label>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          userData?.is_active
                            ? 'bg-bright-halo/20 text-azure-dragon'
                            : 'bg-carbon/10 text-carbon/60'
                        }`}
                      >
                        {userData?.is_active ? t(SETTINGS.ACTIVE) : t(SETTINGS.INACTIVE)}
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
              {/* Hide Preferences content for SYSTEM users with ALL permissions */}
              {!isSystemUserWithAllPermissions ? (
                <form onSubmit={preferencesForm.handleSubmit(handlePreferencesSubmit)} className="space-y-6">
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MdPalette className="h-5 w-5" />
                        {t(SETTINGS.APPEARANCE)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-carbon/60 mb-2">{t(SETTINGS.THEME)}</label>
                          <Select
                            value={preferencesForm.watch('theme') || 'Light'}
                            onChange={(e) => preferencesForm.setValue('theme', e.target.value)}
                            options={[
                              { value: 'Light', label: t(SETTINGS.THEME_LIGHT) },
                              { value: 'Dark', label: t(SETTINGS.THEME_DARK) },
                              { value: 'System', label: t(SETTINGS.THEME_SYSTEM) },
                            ]}
                          />
                          <p className="text-xs text-carbon/50 mt-1.5">{t(SETTINGS.THEME_DESCRIPTION)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MdLanguage className="h-5 w-5" />
                        {t(SETTINGS.LANGUAGE_LOCALE)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-carbon/60 mb-2">{t(SETTINGS.LANGUAGE)}</label>
                          <Select
                            value={preferencesForm.watch('language') || 'en'}
                            onChange={(e) => preferencesForm.setValue('language', e.target.value)}
                            options={[
                              { value: 'en', label: 'English' },
                              { value: 'fr', label: 'Français' },
                              { value: 'rw', label: 'Ikinyarwanda' },
                            ]}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-carbon/60 mb-2">{t(SETTINGS.DATE_FORMAT)}</label>
                          <Select
                            value={preferencesForm.watch('date_format') || 'MM/DD/YYYY'}
                            onChange={(e) => preferencesForm.setValue('date_format', e.target.value)}
                            options={[
                              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                              { value: 'DD MMM YYYY', label: 'DD MMM YYYY' },
                            ]}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-carbon/60 mb-2">{t(SETTINGS.TIME_FORMAT)}</label>
                          <Select
                            value={
                              preferencesForm.watch('time_format') === '24 Hour'
                                ? '24h'
                                : preferencesForm.watch('time_format') === '12 Hour'
                                  ? '12h'
                                  : preferencesForm.watch('time_format') || '12h'
                            }
                            onChange={(e) =>
                              preferencesForm.setValue('time_format', e.target.value === '24h' ? '24 Hour' : '12 Hour')
                            }
                            options={[
                              { value: '12h', label: t(SETTINGS.TIME_12H) },
                              { value: '24h', label: t(SETTINGS.TIME_24H) },
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
                        {t(SETTINGS.NOTIFICATION_PREFS)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-carbon">{t(SETTINGS.EMAIL_NOTIFICATIONS)}</label>
                            <p className="text-xs text-carbon/60">{t(SETTINGS.EMAIL_NOTIFICATIONS_DESC)}</p>
                          </div>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={preferencesForm.watch('email_notifications') ?? true}
                            onChange={(e) => preferencesForm.setValue('email_notifications', e.target.checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-carbon">{t(SETTINGS.SMS_NOTIFICATIONS)}</label>
                            <p className="text-xs text-carbon/60">{t(SETTINGS.SMS_NOTIFICATIONS_DESC)}</p>
                          </div>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={preferencesForm.watch('sms_notifications') ?? false}
                            onChange={(e) => preferencesForm.setValue('sms_notifications', e.target.checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-carbon">{t(SETTINGS.IN_APP_NOTIFICATIONS)}</label>
                            <p className="text-xs text-carbon/60">{t(SETTINGS.IN_APP_NOTIFICATIONS_DESC)}</p>
                          </div>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={preferencesForm.watch('in_app_notifications') ?? true}
                            onChange={(e) => preferencesForm.setValue('in_app_notifications', e.target.checked)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={updatePreferencesMutation.isPending}
                    >
                      {updatePreferencesMutation.isPending ? t(SETTINGS.SAVING) : t(SETTINGS.SAVE_PREFERENCES)}
                    </Button>
                  </div>
                </form>
              ) : (
                <Card variant="elevated">
                  <CardContent className="py-8">
                    <p className="text-sm text-carbon/60 text-center">
                      {t(SETTINGS.PREFS_NOT_AVAILABLE)}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Clinic Settings Tab */}
          {activeTab === 'clinic' && isClinicAdmin && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MdBusiness className="h-5 w-5" />
                  {t(SETTINGS.CLINIC_SETTINGS)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-carbon/60">
                  {t(SETTINGS.CLINIC_SETTINGS_DESC)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* System Settings Tab */}
          {activeTab === 'system' && isSystemAdmin && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MdSettings className="h-5 w-5" />
                  {t(SETTINGS.SYSTEM_SETTINGS)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-carbon/60">
                  {t(SETTINGS.SYSTEM_SETTINGS_DESC)}
                </p>
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
                    {t(SETTINGS.ACTIVE_SESSIONS)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white-smoke rounded-md">
                      <div>
                        <p className="text-sm font-medium text-carbon">{t(SETTINGS.CURRENT_SESSION)}</p>
                        <p className="text-xs text-carbon/60">{t(SETTINGS.THIS_DEVICE)}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-azure-dragon/20 text-azure-dragon rounded">
                        {t(SETTINGS.ACTIVE)}
                      </span>
                    </div>
                    <p className="text-xs text-carbon/50">
                      {t(SETTINGS.SESSION_INFO)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>{t(SETTINGS.LOGIN_HISTORY)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-carbon/60">
                    {t(SETTINGS.LOGIN_HISTORY_DESC)}
                  </p>
                </CardContent>
              </Card>

              {/* Hide Two-Factor Authentication for SYSTEM users with ALL permissions */}
              {!isSystemUserWithAllPermissions && (
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MdSecurity className="h-5 w-5" />
                      {t(SETTINGS.TWO_FACTOR_AUTH)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-carbon">{t(SETTINGS.ENABLE_2FA)}</label>
                          <p className="text-xs text-carbon/60">
                            {t(SETTINGS.ENABLE_2FA_DESC)}
                          </p>
                        </div>
                        <input type="checkbox" className="h-4 w-4" />
                      </div>
                      <p className="text-xs text-carbon/50">
                        {t(SETTINGS.TWO_FA_NOT_AVAILABLE)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
