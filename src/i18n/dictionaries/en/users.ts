export const users: Record<string, string> = {
  // Page titles and descriptions
  'users.usersManagement': 'Users Management',
  'users.manageUsersDesc': 'Manage users and view system administrators',
  'users.createNewUser': 'Create New User',
  'users.addNewUserDesc': 'Add a new user to the system',
  
  // Tabs
  'users.usersTab': 'Users',
  'users.systemAdminsTab': 'System Admins',
  
  // Buttons
  'users.createUser': 'Create User',
  'users.createSystemAdmin': 'Create System Admin',
  'users.creating': 'Creating...',
  'users.cancel': 'Cancel',
  
  // Form sections
  'users.basicInformation': 'Basic Information',
  'users.employmentInformation': 'Employment Information',
  
  // Form fields
  'users.firstName': 'First Name',
  'users.lastName': 'Last Name',
  'users.email': 'Email',
  'users.username': 'Username',
  'users.phone': 'Phone',
  'users.gender': 'Gender',
  'users.selectGender': 'Select gender',
  'users.male': 'Male',
  'users.female': 'Female',
  'users.other': 'Other',
  'users.dateOfBirth': 'Date of Birth',
  'users.role': 'Role',
  'users.clinic': 'Clinic',
  'users.selectClinicFilter': 'Select Clinic',
  'users.pleaseSelectClinic': 'Please select clinic',
  'users.department': 'Department',
  'users.position': 'Position',
  'users.hireDate': 'Hire Date',
  
  // Role options
  'users.operator': 'Operator',
  'users.manager': 'Manager',
  
  // Validation messages
  'users.firstNameRequired': 'First name is required',
  'users.lastNameRequired': 'Last name is required',
  'users.emailRequired': 'Email is required',
  'users.emailInvalid': 'Invalid email',
  'users.usernameRequired': 'Username is required',
  'users.usernameMinLength': 'Username must be at least 3 characters',
  'users.phoneRequired': 'Phone number is required',
  'users.dateOfBirthRequired': 'Date of birth is required',
  'users.genderRequired': 'Gender is required',
  'users.roleRequired': 'Role is required',
  'users.clinicRequiredForManager': 'Clinic is required for Manager role',
  'users.departmentRequired': 'Department is required',
  'users.positionRequired': 'Position is required',
  'users.hireDateRequired': 'Hire date is required',
  
  // Filters
  'users.selectClinic': 'Select a clinic',
  'users.allClinics': 'All Clinics',
  'users.searchPlaceholder': 'Search by name, email, username...',
  'users.allRoles': 'All Roles',
  
  // Roles
  'users.roleManager': 'Manager',
  'users.roleDoctor': 'Doctor',
  'users.roleNurse': 'Nurse',
  'users.roleReceptionist': 'Receptionist',
  
  // Status
  'users.active': 'Active',
  'users.inactive': 'Inactive',
  'users.all': 'All',
  
  // Messages
  'users.selectClinicMessage': 'Please select a clinic to view its administrators',
  'users.selectClinicHint': 'Use the clinic filter above to get started',
  'users.failedLoadUsers': 'Failed to load users. Please try again.',
  'users.failedLoadSystemAdmins': 'Failed to load system admins. Please try again.',
  'users.userCreatedSuccess': 'User created successfully!',
  'users.failedCreateUser': 'Failed to create user. Please try again.',
  
  // Table headers
  'users.usersCount': 'Users',
  'users.clinicAdminsFor': 'Clinic Admins for',
  'users.systemAdminsCount': 'System Admins',
  
  // Pagination
  'users.showing': 'Showing',
  'users.to': 'to',
  'users.of': 'of',
  'users.usersLower': 'users',
  'users.adminsLower': 'admins',
  'users.previous': 'Previous',
  'users.next': 'Next',
  
  // Confirmation modals
  'users.deactivateClinicAdmin': 'Deactivate Clinic Admin',
  'users.deactivateClinicAdminMsg': 'Are you sure you want to deactivate this clinic admin? The admin will be marked as inactive and will not be able to access the system.',
  'users.activateClinicAdmin': 'Activate Clinic Admin',
  'users.activateClinicAdminMsg': 'Are you sure you want to activate this clinic admin? The admin will be able to access the system again.',
  'users.deactivateSystemAdmin': 'Deactivate System Admin',
  'users.deactivateSystemAdminMsg': 'Are you sure you want to deactivate this system admin? The admin will be marked as inactive and will not be able to access the system.',
  'users.activateSystemAdmin': 'Activate System Admin',
  'users.activateSystemAdminMsg': 'Are you sure you want to activate this system admin? The admin will be able to access the system again.',
  'users.activateAction': 'Activate',
  
  // Success messages
  'users.userDeactivated': 'User deactivated successfully!',
  'users.userActivated': 'User activated successfully!',
  'users.systemAdminDeactivated': 'System admin deactivated successfully!',
  'users.systemAdminActivated': 'System admin activated successfully!',
  
  // Error messages
  'users.failedDeactivateUser': 'Failed to deactivate user',
  'users.failedActivateUser': 'Failed to activate user',
  'users.failedDeactivateSystemAdmin': 'Failed to deactivate system admin',
  'users.failedActivateSystemAdmin': 'Failed to activate system admin',
  
  // Modal titles
  'users.editSystemAdmin': 'Edit System Admin',
  'users.password': 'Password',
  'users.confirmPassword': 'Confirm Password',
  'users.enterFirstName': 'Enter first name',
  'users.enterLastName': 'Enter last name',
  'users.enterEmail': 'Enter email address',
  'users.enterUsername': 'Enter username',
  'users.enterPassword': 'Enter password',
  'users.confirmPasswordPlaceholder': 'Confirm password',
  'users.generatePassword': 'Generate secure password',
  'users.showPassword': 'Show password',
  'users.hidePassword': 'Hide password',
  'users.passwordMinLength': 'Password must be at least 8 characters',
  'users.passwordComplexity': 'Password must contain uppercase, lowercase, and number',
  'users.passwordsDontMatch': "Passwords don't match",
  'users.userInformation': 'User Information',
  'users.forClinic': 'for {{clinicName}}',
  'users.systemAdminInformation': 'System Admin Information',
  'users.editUser': 'Edit User',
  'users.updateUser': 'Update User',
  'users.updateSystemAdmin': 'Update System Admin',
  'users.updating': 'Updating...',
  'users.userUpdatedSuccess': 'User updated successfully!',
  'users.failedUpdateUser': 'Failed to update user. Please try again.',
  'users.systemAdminCreatedSuccess': 'System admin created successfully!',
  'users.failedCreateSystemAdmin': 'Failed to create system admin. Please try again.',
  'users.systemAdminUpdatedSuccess': 'System admin updated successfully!',
  'users.failedUpdateSystemAdmin': 'Failed to update system admin. Please try again.',
  'users.doctorRoleCannotChange': 'Doctor role cannot be changed',
  'users.selectRole': 'Select role',
  'users.doctor': 'Doctor',
  'users.thName': 'Name',
  'users.thEmail': 'Email',
  'users.thUsername': 'Username',
  'users.thPhone': 'Phone',
  'users.thDepartment': 'Department',
  'users.thStatus': 'Status',
  'users.thActions': 'Actions',
  'users.noAdminsFoundFor': 'No admins found for {{clinicName}}',
  'users.noClinicAdminsFound': 'No clinic admins found',
  'users.noSystemAdminsFound': 'No system admins found',
  'users.editAdmin': 'Edit admin',
  'users.deactivateAdmin': 'Deactivate admin',
  'users.activateAdmin': 'Activate admin',
};
