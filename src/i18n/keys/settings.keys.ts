export const SETTINGS = {
  // Page
  PAGE_TITLE: 'settings.pageTitle',
  PAGE_SUBTITLE: 'settings.pageSubtitle',

  // Tabs
  TAB_PROFILE: 'settings.tabProfile',
  TAB_PREFERENCES: 'settings.tabPreferences',
  TAB_CLINIC: 'settings.tabClinic',
  TAB_SYSTEM: 'settings.tabSystem',
  TAB_SECURITY: 'settings.tabSecurity',

  // Profile - Personal Information
  PERSONAL_INFO: 'settings.personalInfo',
  FIRST_NAME: 'settings.firstName',
  LAST_NAME: 'settings.lastName',
  EMAIL: 'settings.email',
  PHONE: 'settings.phone',
  EMAIL_CANNOT_CHANGE: 'settings.emailCannotChange',
  SAVE_CHANGES: 'settings.saveChanges',
  SAVING: 'settings.saving',

  // Profile - Change Password
  CHANGE_PASSWORD: 'settings.changePassword',
  CURRENT_PASSWORD: 'settings.currentPassword',
  NEW_PASSWORD: 'settings.newPassword',
  CONFIRM_NEW_PASSWORD: 'settings.confirmNewPassword',
  CHANGING: 'settings.changing',
  PASSWORD_CHANGED: 'settings.passwordChanged',

  // Profile - Account Information
  ACCOUNT_INFO: 'settings.accountInfo',
  USERNAME: 'settings.username',
  ROLE: 'settings.role',
  CLINIC_CODE: 'settings.clinicCode',
  ACCOUNT_STATUS: 'settings.accountStatus',
  ACTIVE: 'settings.active',
  INACTIVE: 'settings.inactive',

  // Preferences - Appearance
  APPEARANCE: 'settings.appearance',
  THEME: 'settings.theme',
  THEME_LIGHT: 'settings.themeLight',
  THEME_DARK: 'settings.themeDark',
  THEME_SYSTEM: 'settings.themeSystem',
  THEME_DESCRIPTION: 'settings.themeDescription',

  // Preferences - Language & Locale
  LANGUAGE_LOCALE: 'settings.languageLocale',
  LANGUAGE: 'settings.language',
  DATE_FORMAT: 'settings.dateFormat',
  TIME_FORMAT: 'settings.timeFormat',
  TIME_12H: 'settings.time12h',
  TIME_24H: 'settings.time24h',

  // Preferences - Notifications
  NOTIFICATION_PREFS: 'settings.notificationPrefs',
  EMAIL_NOTIFICATIONS: 'settings.emailNotifications',
  EMAIL_NOTIFICATIONS_DESC: 'settings.emailNotificationsDesc',
  SMS_NOTIFICATIONS: 'settings.smsNotifications',
  SMS_NOTIFICATIONS_DESC: 'settings.smsNotificationsDesc',
  IN_APP_NOTIFICATIONS: 'settings.inAppNotifications',
  IN_APP_NOTIFICATIONS_DESC: 'settings.inAppNotificationsDesc',
  SAVE_PREFERENCES: 'settings.savePreferences',
  PREFS_NOT_AVAILABLE: 'settings.prefsNotAvailable',

  // Preferences - Success/Error
  PROFILE_UPDATED: 'settings.profileUpdated',
  PROFILE_UPDATE_FAILED: 'settings.profileUpdateFailed',
  PREFS_UPDATED: 'settings.prefsUpdated',
  PREFS_UPDATE_FAILED: 'settings.prefsUpdateFailed',
  PASSWORD_CHANGE_FAILED: 'settings.passwordChangeFailed',
  USER_ID_NOT_FOUND: 'settings.userIdNotFound',

  // Clinic Settings
  CLINIC_SETTINGS: 'settings.clinicSettings',
  CLINIC_SETTINGS_DESC: 'settings.clinicSettingsDesc',

  // System Settings
  SYSTEM_SETTINGS: 'settings.systemSettings',
  SYSTEM_SETTINGS_DESC: 'settings.systemSettingsDesc',

  // Security
  ACTIVE_SESSIONS: 'settings.activeSessions',
  CURRENT_SESSION: 'settings.currentSession',
  THIS_DEVICE: 'settings.thisDevice',
  SESSION_INFO: 'settings.sessionInfo',
  LOGIN_HISTORY: 'settings.loginHistory',
  LOGIN_HISTORY_DESC: 'settings.loginHistoryDesc',
  TWO_FACTOR_AUTH: 'settings.twoFactorAuth',
  ENABLE_2FA: 'settings.enable2fa',
  ENABLE_2FA_DESC: 'settings.enable2faDesc',
  TWO_FA_NOT_AVAILABLE: 'settings.twoFaNotAvailable',

  // Validation
  FIRST_NAME_REQUIRED: 'settings.firstNameRequired',
  LAST_NAME_REQUIRED: 'settings.lastNameRequired',
  INVALID_EMAIL: 'settings.invalidEmail',
  CURRENT_PASSWORD_REQUIRED: 'settings.currentPasswordRequired',
  PASSWORD_MIN_LENGTH: 'settings.passwordMinLength',
  PASSWORD_COMPLEXITY: 'settings.passwordComplexity',
  PASSWORDS_DONT_MATCH: 'settings.passwordsDontMatch',
} as const;
