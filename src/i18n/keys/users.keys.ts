export const USERS = {
  // Page titles and descriptions
  USERS_MANAGEMENT: 'users.usersManagement',
  MANAGE_USERS_DESC: 'users.manageUsersDesc',
  CREATE_NEW_USER: 'users.createNewUser',
  ADD_NEW_USER_DESC: 'users.addNewUserDesc',
  
  // Tabs
  USERS_TAB: 'users.usersTab',
  SYSTEM_ADMINS_TAB: 'users.systemAdminsTab',
  
  // Buttons
  CREATE_USER: 'users.createUser',
  CREATE_SYSTEM_ADMIN: 'users.createSystemAdmin',
  CREATING: 'users.creating',
  CANCEL: 'users.cancel',
  
  // Form sections
  BASIC_INFORMATION: 'users.basicInformation',
  EMPLOYMENT_INFORMATION: 'users.employmentInformation',
  
  // Form fields
  FIRST_NAME: 'users.firstName',
  LAST_NAME: 'users.lastName',
  EMAIL: 'users.email',
  USERNAME: 'users.username',
  PHONE: 'users.phone',
  GENDER: 'users.gender',
  SELECT_GENDER: 'users.selectGender',
  MALE: 'users.male',
  FEMALE: 'users.female',
  OTHER: 'users.other',
  DATE_OF_BIRTH: 'users.dateOfBirth',
  ROLE: 'users.role',
  CLINIC: 'users.clinic',
  SELECT_CLINIC: 'users.selectClinic',
  PLEASE_SELECT_CLINIC: 'users.pleaseSelectClinic',
  DEPARTMENT: 'users.department',
  POSITION: 'users.position',
  HIRE_DATE: 'users.hireDate',
  
  // Role options
  OPERATOR: 'users.operator',
  MANAGER: 'users.manager',
  
  // Validation messages
  FIRST_NAME_REQUIRED: 'users.firstNameRequired',
  LAST_NAME_REQUIRED: 'users.lastNameRequired',
  EMAIL_REQUIRED: 'users.emailRequired',
  EMAIL_INVALID: 'users.emailInvalid',
  USERNAME_REQUIRED: 'users.usernameRequired',
  USERNAME_MIN_LENGTH: 'users.usernameMinLength',
  PHONE_REQUIRED: 'users.phoneRequired',
  DATE_OF_BIRTH_REQUIRED: 'users.dateOfBirthRequired',
  GENDER_REQUIRED: 'users.genderRequired',
  ROLE_REQUIRED: 'users.roleRequired',
  CLINIC_REQUIRED_FOR_MANAGER: 'users.clinicRequiredForManager',
  DEPARTMENT_REQUIRED: 'users.departmentRequired',
  POSITION_REQUIRED: 'users.positionRequired',
  HIRE_DATE_REQUIRED: 'users.hireDateRequired',
  
  // Filters
  SELECT_CLINIC_FILTER: 'users.selectClinicFilter',
  ALL_CLINICS: 'users.allClinics',
  SEARCH_PLACEHOLDER: 'users.searchPlaceholder',
  ALL_ROLES: 'users.allRoles',
  
  // Roles
  ROLE_MANAGER: 'users.roleManager',
  ROLE_DOCTOR: 'users.roleDoctor',
  ROLE_NURSE: 'users.roleNurse',
  ROLE_RECEPTIONIST: 'users.roleReceptionist',
  
  // Status
  ACTIVE: 'users.active',
  INACTIVE: 'users.inactive',
  ALL: 'users.all',
  
  // Messages
  SELECT_CLINIC_MESSAGE: 'users.selectClinicMessage',
  SELECT_CLINIC_HINT: 'users.selectClinicHint',
  FAILED_LOAD_USERS: 'users.failedLoadUsers',
  FAILED_LOAD_SYSTEM_ADMINS: 'users.failedLoadSystemAdmins',
  USER_CREATED_SUCCESS: 'users.userCreatedSuccess',
  FAILED_CREATE_USER: 'users.failedCreateUser',
  
  // Table headers
  USERS_COUNT: 'users.usersCount',
  CLINIC_ADMINS_FOR: 'users.clinicAdminsFor',
  SYSTEM_ADMINS_COUNT: 'users.systemAdminsCount',
  
  // Pagination
  SHOWING: 'users.showing',
  TO: 'users.to',
  OF: 'users.of',
  USERS_LOWER: 'users.usersLower',
  ADMINS_LOWER: 'users.adminsLower',
  PREVIOUS: 'users.previous',
  NEXT: 'users.next',
  
  // Confirmation modals
  DEACTIVATE_CLINIC_ADMIN: 'users.deactivateClinicAdmin',
  DEACTIVATE_CLINIC_ADMIN_MSG: 'users.deactivateClinicAdminMsg',
  ACTIVATE_CLINIC_ADMIN: 'users.activateClinicAdmin',
  ACTIVATE_CLINIC_ADMIN_MSG: 'users.activateClinicAdminMsg',
  DEACTIVATE_SYSTEM_ADMIN: 'users.deactivateSystemAdmin',
  DEACTIVATE_SYSTEM_ADMIN_MSG: 'users.deactivateSystemAdminMsg',
  ACTIVATE_SYSTEM_ADMIN: 'users.activateSystemAdmin',
  ACTIVATE_SYSTEM_ADMIN_MSG: 'users.activateSystemAdminMsg',
  ACTIVATE_ACTION: 'users.activateAction',
  
  // Success messages
  USER_DEACTIVATED: 'users.userDeactivated',
  USER_ACTIVATED: 'users.userActivated',
  SYSTEM_ADMIN_DEACTIVATED: 'users.systemAdminDeactivated',
  SYSTEM_ADMIN_ACTIVATED: 'users.systemAdminActivated',
  
  // Error messages
  FAILED_DEACTIVATE_USER: 'users.failedDeactivateUser',
  FAILED_ACTIVATE_USER: 'users.failedActivateUser',
  FAILED_DEACTIVATE_SYSTEM_ADMIN: 'users.failedDeactivateSystemAdmin',
  FAILED_ACTIVATE_SYSTEM_ADMIN: 'users.failedActivateSystemAdmin',
  
  // Modal titles
  EDIT_SYSTEM_ADMIN: 'users.editSystemAdmin',
} as const;
