export const ORGANIZATION = {
  // Page titles
  ORGANIZATIONS: 'org.organizations',
  MANAGE_ORGANIZATIONS: 'org.manageOrganizations',
  CREATE_ORGANIZATION: 'org.createOrganization',
  EDIT_ORGANIZATION: 'org.editOrganization',
  ORGANIZATION_DETAILS: 'org.organizationDetails',

  // Fields
  NAME: 'org.name',
  TYPE: 'org.type',
  CONTACT_EMAIL: 'org.contactEmail',
  CONTACT_PHONE: 'org.contactPhone',
  SLUG: 'org.slug',
  OWNER: 'org.owner',
  LOGO: 'org.logo',
  ADDRESS: 'org.address',
  SETTINGS: 'org.settings',
  CLINIC_COUNT: 'org.clinicCount',

  // Types
  TYPE_SINGLE_CLINIC: 'org.typeSingleClinic',
  TYPE_MULTI_BRANCH: 'org.typeMultiBranch',
  TYPE_HEALTH_NETWORK: 'org.typeHealthNetwork',

  // Address fields
  ADDRESS_LINE1: 'org.addressLine1',
  ADDRESS_LINE2: 'org.addressLine2',
  CITY: 'org.city',
  PROVINCE: 'org.province',
  COUNTRY: 'org.country',
  POSTAL_CODE: 'org.postalCode',

  // Settings
  DEFAULT_LANGUAGE: 'org.defaultLanguage',
  DEFAULT_TIMEZONE: 'org.defaultTimezone',
  DEFAULT_CURRENCY: 'org.defaultCurrency',

  // Owner
  OWNER_EMAIL: 'org.ownerEmail',
  OWNER_FIRST_NAME: 'org.ownerFirstName',
  OWNER_LAST_NAME: 'org.ownerLastName',
  OWNER_PHONE: 'org.ownerPhone',
  OWNER_PASSWORD: 'org.ownerPassword',
  ASSIGN_OWNER: 'org.assignOwner',
  ASSIGN_OWNER_DESCRIPTION: 'org.assignOwnerDescription',
  OWNER_INVITED: 'org.ownerInvited',
  OWNER_MODE_CREATE: 'org.ownerModeCreate',
  OWNER_MODE_INVITE: 'org.ownerModeInvite',
  OWNER_CREATE_DESCRIPTION: 'org.ownerCreateDescription',
  OWNER_INVITE_DESCRIPTION: 'org.ownerInviteDescription',
  NO_OWNER_ASSIGNED: 'org.noOwnerAssigned',
  NO_OWNER_HINT: 'org.noOwnerHint',
  INVITE_OWNER: 'org.inviteOwner',
  RESEND_INVITATION: 'org.resendInvitation',
  INVITATION_RESENT: 'org.invitationResent',
  FAILED_RESEND: 'org.failedResend',
  OWNER_STATUS_ACTIVE: 'org.ownerStatusActive',
  OWNER_STATUS_PENDING: 'org.ownerStatusPending',
  OWNER_STATUS_SUSPENDED: 'org.ownerStatusSuspended',
  OWNER_JOINED: 'org.ownerJoined',
  OWNER_INVITED_AT: 'org.ownerInvitedAt',

  // Actions
  ADD_CLINIC: 'org.addClinic',
  REMOVE_CLINIC: 'org.removeClinic',
  DEACTIVATE: 'org.deactivate',

  // Messages
  CREATED_SUCCESS: 'org.createdSuccess',
  UPDATED_SUCCESS: 'org.updatedSuccess',
  DEACTIVATED_SUCCESS: 'org.deactivatedSuccess',
  CLINIC_ADDED: 'org.clinicAdded',
  CLINIC_REMOVED: 'org.clinicRemoved',
  FAILED_CREATE: 'org.failedCreate',
  FAILED_UPDATE: 'org.failedUpdate',
  FAILED_LOAD: 'org.failedLoad',

  // Validation
  NAME_REQUIRED: 'org.nameRequired',
  TYPE_REQUIRED: 'org.typeRequired',
  EMAIL_REQUIRED: 'org.emailRequired',
  EMAIL_INVALID: 'org.emailInvalid',
  PHONE_REQUIRED: 'org.phoneRequired',

  // Org Owner pages
  MY_ORGANIZATION: 'org.myOrganization',
  MY_ORGANIZATION_DESC: 'org.myOrganizationDesc',
  ORG_CLINICS: 'org.orgClinics',
  ORG_CLINICS_DESC: 'org.orgClinicsDesc',
  ORG_MEMBERS: 'org.orgMembers',
  ORG_MEMBERS_DESC: 'org.orgMembersDesc',
  INVITE_MEMBER: 'org.inviteMember',
  MEMBER_INVITED: 'org.memberInvited',
  MEMBER_UPDATED: 'org.memberUpdated',
  MEMBER_REMOVED: 'org.memberRemoved',
  FAILED_INVITE: 'org.failedInvite',
  FAILED_UPDATE_MEMBER: 'org.failedUpdateMember',
  FAILED_REMOVE_MEMBER: 'org.failedRemoveMember',
  FAILED_LOAD_MEMBERS: 'org.failedLoadMembers',
  CONFIRM_REMOVE_MEMBER: 'org.confirmRemoveMember',
  CONFIRM_REMOVE_MEMBER_MSG: 'org.confirmRemoveMemberMsg',
  CONFIRM_REMOVE_CLINIC: 'org.confirmRemoveClinic',
  CONFIRM_REMOVE_CLINIC_MSG: 'org.confirmRemoveClinicMsg',
  NO_CLINICS: 'org.noClinics',
  NO_CLINICS_HINT: 'org.noClinicsHint',
  NO_MEMBERS: 'org.noMembers',
  NO_MEMBERS_HINT: 'org.noMembersHint',
  MEMBER_ROLE: 'org.memberRole',
  MEMBER_STATUS: 'org.memberStatus',
  CLINIC_NAME: 'org.clinicName',
  ADD_CLINIC_BY_ID: 'org.addClinicById',
  CLINIC_ID_PLACEHOLDER: 'org.clinicIdPlaceholder',
  TOTAL_CLINICS: 'org.totalClinics',
  TOTAL_MEMBERS: 'org.totalMembers',
  ACTIVE_MEMBERS: 'org.activeMembers',
  PENDING_INVITATIONS: 'org.pendingInvitations',
  CLINIC_REQUIRED: 'org.clinicRequired',
} as const;

export const PLAN = {
  // Page titles
  PLANS: 'plan.plans',
  PLAN_DETAILS: 'plan.planDetails',
  CREATE_PLAN: 'plan.createPlan',
  EDIT_PLAN: 'plan.editPlan',

  // Fields
  NAME: 'plan.name',
  TIER: 'plan.tier',
  DESCRIPTION: 'plan.description',
  BILLING_CYCLE: 'plan.billingCycle',
  PRICE: 'plan.price',
  CURRENCY: 'plan.currency',
  TRIAL_DAYS: 'plan.trialDays',
  LIMITS: 'plan.limits',
  FEATURES: 'plan.features',

  // Tiers
  TIER_FREE: 'plan.tierFree',
  TIER_STARTER: 'plan.tierStarter',
  TIER_PROFESSIONAL: 'plan.tierProfessional',
  TIER_ENTERPRISE: 'plan.tierEnterprise',

  // Billing cycles
  MONTHLY: 'plan.monthly',
  QUARTERLY: 'plan.quarterly',
  ANNUAL: 'plan.annual',

  // Limits
  MAX_DOCTORS: 'plan.maxDoctors',
  MAX_STAFF: 'plan.maxStaff',
  MAX_APPOINTMENTS: 'plan.maxAppointments',
  MAX_PATIENTS: 'plan.maxPatients',
  MAX_BRANCHES: 'plan.maxBranches',
  MAX_SERVICES: 'plan.maxServices',
  MAX_SMS: 'plan.maxSms',
  STORAGE: 'plan.storage',

  // Messages
  CREATED_SUCCESS: 'plan.createdSuccess',
  UPDATED_SUCCESS: 'plan.updatedSuccess',
  FAILED_LOAD: 'plan.failedLoad',
} as const;

export const SUBSCRIPTION = {
  // Page titles
  SUBSCRIPTION: 'sub.subscription',
  MANAGE_SUBSCRIPTION: 'sub.manageSubscription',

  // Status
  STATUS_TRIALING: 'sub.statusTrialing',
  STATUS_ACTIVE: 'sub.statusActive',
  STATUS_PAST_DUE: 'sub.statusPastDue',
  STATUS_CANCELED: 'sub.statusCanceled',
  STATUS_EXPIRED: 'sub.statusExpired',

  // Actions
  UPGRADE: 'sub.upgrade',
  DOWNGRADE: 'sub.downgrade',
  CANCEL: 'sub.cancel',
  REACTIVATE: 'sub.reactivate',
  START_TRIAL: 'sub.startTrial',

  // Payment
  PAYMENT_MTN: 'sub.paymentMtn',
  PAYMENT_AIRTEL: 'sub.paymentAirtel',
  PAYMENT_BANK: 'sub.paymentBank',
  PAYMENT_MANUAL: 'sub.paymentManual',

  // Usage
  CURRENT_USAGE: 'sub.currentUsage',
  PLAN_LIMIT: 'sub.planLimit',
  USAGE_PERCENTAGE: 'sub.usagePercentage',
  LIMIT_REACHED: 'sub.limitReached',
  UPGRADE_SUGGESTED: 'sub.upgradeSuggested',

  // Cancel reasons
  REASON_TOO_EXPENSIVE: 'sub.reasonTooExpensive',
  REASON_MISSING_FEATURES: 'sub.reasonMissingFeatures',
  REASON_SWITCHING: 'sub.reasonSwitching',
  REASON_CLOSING: 'sub.reasonClosing',
  REASON_OTHER: 'sub.reasonOther',

  // Messages
  CREATED_SUCCESS: 'sub.createdSuccess',
  UPGRADED_SUCCESS: 'sub.upgradedSuccess',
  CANCELED_SUCCESS: 'sub.canceledSuccess',
  REACTIVATED_SUCCESS: 'sub.reactivatedSuccess',
  TRIAL_STARTED: 'sub.trialStarted',
  DOWNGRADE_BLOCKED: 'sub.downgradeBlocked',
  FAILED_LOAD: 'sub.failedLoad',

  // Period
  CURRENT_PERIOD: 'sub.currentPeriod',
  TRIAL_ENDS: 'sub.trialEnds',
  DAYS_REMAINING: 'sub.daysRemaining',
} as const;

export const ONBOARDING = {
  // Page titles
  ONBOARDING: 'onb.onboarding',
  WELCOME: 'onb.welcome',
  SETUP_CLINIC: 'onb.setupClinic',

  // Status
  NOT_STARTED: 'onb.notStarted',
  IN_PROGRESS: 'onb.inProgress',
  COMPLETED: 'onb.completed',
  SKIPPED: 'onb.skipped',

  // Actions
  START: 'onb.start',
  NEXT_STEP: 'onb.nextStep',
  PREVIOUS_STEP: 'onb.previousStep',
  SKIP: 'onb.skip',
  COMPLETE: 'onb.complete',

  // Checklist
  CHECKLIST: 'onb.checklist',
  CHECKLIST_ITEM_COMPLETE: 'onb.checklistItemComplete',
  CHECKLIST_ITEM_DISMISS: 'onb.checklistItemDismiss',

  // Messages
  STARTED_SUCCESS: 'onb.startedSuccess',
  STEP_COMPLETED: 'onb.stepCompleted',
  ONBOARDING_COMPLETED: 'onb.onboardingCompleted',
  ONBOARDING_SKIPPED: 'onb.onboardingSkipped',
} as const;

export const SYSTEM_ADMIN = {
  // Page titles
  SYSTEM_ADMINS: 'sysAdmin.systemAdmins',
  MANAGE_SYSTEM_ADMINS: 'sysAdmin.manageSystemAdmins',
  CREATE_SYSTEM_ADMIN: 'sysAdmin.createSystemAdmin',
  EDIT_SYSTEM_ADMIN: 'sysAdmin.editSystemAdmin',
  SYSTEM_ADMIN_DETAILS: 'sysAdmin.systemAdminDetails',

  // Fields
  EMAIL: 'sysAdmin.email',
  PASSWORD: 'sysAdmin.password',
  NAME: 'sysAdmin.name',
  IS_ACTIVE: 'sysAdmin.isActive',
  LAST_LOGIN: 'sysAdmin.lastLogin',

  // Actions
  DEACTIVATE: 'sysAdmin.deactivate',
  ACTIVATE: 'sysAdmin.activate',

  // Messages
  CREATED_SUCCESS: 'sysAdmin.createdSuccess',
  UPDATED_SUCCESS: 'sysAdmin.updatedSuccess',
  DEACTIVATED_SUCCESS: 'sysAdmin.deactivatedSuccess',
  FAILED_CREATE: 'sysAdmin.failedCreate',
  FAILED_UPDATE: 'sysAdmin.failedUpdate',
  FAILED_LOAD: 'sysAdmin.failedLoad',
  CANNOT_DELETE_SELF: 'sysAdmin.cannotDeleteSelf',

  // Validation
  EMAIL_REQUIRED: 'sysAdmin.emailRequired',
  EMAIL_INVALID: 'sysAdmin.emailInvalid',
  PASSWORD_REQUIRED: 'sysAdmin.passwordRequired',
  PASSWORD_MIN_LENGTH: 'sysAdmin.passwordMinLength',
} as const;
