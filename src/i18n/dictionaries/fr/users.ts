export const users: Record<string, string> = {
  // Page titles and descriptions
  'users.usersManagement': 'Gestion des Utilisateurs',
  'users.manageUsersDesc': 'Gérer les utilisateurs et voir les administrateurs système',
  'users.createNewUser': 'Créer un Nouvel Utilisateur',
  'users.addNewUserDesc': 'Ajouter un nouvel utilisateur au système',
  
  // Tabs
  'users.usersTab': 'Utilisateurs',
  'users.systemAdminsTab': 'Administrateurs Système',
  
  // Buttons
  'users.createUser': 'Créer un Utilisateur',
  'users.createSystemAdmin': 'Créer un Administrateur Système',
  'users.creating': 'Création...',
  'users.cancel': 'Annuler',
  
  // Form sections
  'users.basicInformation': 'Informations de Base',
  'users.employmentInformation': 'Informations d\'Emploi',
  
  // Form fields
  'users.firstName': 'Prénom',
  'users.lastName': 'Nom',
  'users.email': 'Email',
  'users.username': 'Nom d\'utilisateur',
  'users.phone': 'Téléphone',
  'users.gender': 'Genre',
  'users.selectGender': 'Sélectionner le genre',
  'users.male': 'Homme',
  'users.female': 'Femme',
  'users.other': 'Autre',
  'users.dateOfBirth': 'Date de Naissance',
  'users.role': 'Rôle',
  'users.clinic': 'Clinique',
  'users.selectClinicFilter': 'Sélectionner une Clinique',
  'users.pleaseSelectClinic': 'Veuillez sélectionner une clinique',
  'users.department': 'Département',
  'users.position': 'Poste',
  'users.hireDate': 'Date d\'Embauche',
  
  // Role options
  'users.operator': 'Opérateur',
  'users.manager': 'Gestionnaire',
  
  // Validation messages
  'users.firstNameRequired': 'Le prénom est requis',
  'users.lastNameRequired': 'Le nom est requis',
  'users.emailRequired': 'L\'email est requis',
  'users.emailInvalid': 'Email invalide',
  'users.usernameRequired': 'Le nom d\'utilisateur est requis',
  'users.usernameMinLength': 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
  'users.phoneRequired': 'Le numéro de téléphone est requis',
  'users.dateOfBirthRequired': 'La date de naissance est requise',
  'users.genderRequired': 'Le genre est requis',
  'users.roleRequired': 'Le rôle est requis',
  'users.clinicRequiredForManager': 'La clinique est requise pour le rôle de Gestionnaire',
  'users.departmentRequired': 'Le département est requis',
  'users.positionRequired': 'Le poste est requis',
  'users.hireDateRequired': 'La date d\'embauche est requise',
  
  // Filters
  'users.selectClinic': 'Sélectionner une Clinique',
  'users.allClinics': 'Toutes les Cliniques',
  'users.searchPlaceholder': 'Rechercher par nom, email, nom d\'utilisateur...',
  'users.allRoles': 'Tous les Rôles',
  
  // Roles
  'users.roleManager': 'Gestionnaire',
  'users.roleDoctor': 'Médecin',
  'users.roleNurse': 'Infirmier(ère)',
  'users.roleReceptionist': 'Réceptionniste',
  
  // Status
  'users.active': 'Actif',
  'users.inactive': 'Inactif',
  'users.all': 'Tous',
  
  // Messages
  'users.selectClinicMessage': 'Veuillez sélectionner une clinique pour voir ses administrateurs',
  'users.selectClinicHint': 'Utilisez le filtre de clinique ci-dessus pour commencer',
  'users.failedLoadUsers': 'Échec du chargement des utilisateurs. Veuillez réessayer.',
  'users.failedLoadSystemAdmins': 'Échec du chargement des administrateurs système. Veuillez réessayer.',
  'users.userCreatedSuccess': 'Utilisateur créé avec succès !',
  'users.failedCreateUser': 'Échec de création de l\'utilisateur. Veuillez réessayer.',
  
  // Table headers
  'users.usersCount': 'Utilisateurs',
  'users.clinicAdminsFor': 'Administrateurs de Clinique pour',
  'users.systemAdminsCount': 'Administrateurs Système',
  
  // Pagination
  'users.showing': 'Affichage',
  'users.to': 'à',
  'users.of': 'sur',
  'users.usersLower': 'utilisateurs',
  'users.adminsLower': 'administrateurs',
  'users.previous': 'Précédent',
  'users.next': 'Suivant',
  
  // Confirmation modals
  'users.deactivateClinicAdmin': 'Désactiver l\'Administrateur de Clinique',
  'users.deactivateClinicAdminMsg': 'Êtes-vous sûr de vouloir désactiver cet administrateur de clinique? L\'administrateur sera marqué comme inactif et ne pourra plus accéder au système.',
  'users.activateClinicAdmin': 'Activer l\'Administrateur de Clinique',
  'users.activateClinicAdminMsg': 'Êtes-vous sûr de vouloir activer cet administrateur de clinique? L\'administrateur pourra à nouveau accéder au système.',
  'users.deactivateSystemAdmin': 'Désactiver l\'Administrateur Système',
  'users.deactivateSystemAdminMsg': 'Êtes-vous sûr de vouloir désactiver cet administrateur système? L\'administrateur sera marqué comme inactif et ne pourra plus accéder au système.',
  'users.activateSystemAdmin': 'Activer l\'Administrateur Système',
  'users.activateSystemAdminMsg': 'Êtes-vous sûr de vouloir activer cet administrateur système? L\'administrateur pourra à nouveau accéder au système.',
  'users.activateAction': 'Activer',
  
  // Success messages
  'users.userDeactivated': 'Utilisateur désactivé avec succès!',
  'users.userActivated': 'Utilisateur activé avec succès!',
  'users.systemAdminDeactivated': 'Administrateur système désactivé avec succès!',
  'users.systemAdminActivated': 'Administrateur système activé avec succès!',
  
  // Error messages
  'users.failedDeactivateUser': 'Échec de la désactivation de l\'utilisateur',
  'users.failedActivateUser': 'Échec de l\'activation de l\'utilisateur',
  'users.failedDeactivateSystemAdmin': 'Échec de la désactivation de l\'administrateur système',
  'users.failedActivateSystemAdmin': 'Échec de l\'activation de l\'administrateur système',
  
  // Modal titles
  'users.editSystemAdmin': 'Modifier l\'Administrateur Système',
  'users.password': 'Mot de passe',
  'users.confirmPassword': 'Confirmer le mot de passe',
  'users.enterFirstName': 'Entrez le prénom',
  'users.enterLastName': 'Entrez le nom',
  'users.enterEmail': "Entrez l'adresse e-mail",
  'users.enterUsername': "Entrez le nom d'utilisateur",
  'users.enterPassword': 'Entrez le mot de passe',
  'users.confirmPasswordPlaceholder': 'Confirmer le mot de passe',
  'users.generatePassword': 'Générer un mot de passe sécurisé',
  'users.showPassword': 'Afficher le mot de passe',
  'users.hidePassword': 'Masquer le mot de passe',
  'users.passwordMinLength': 'Le mot de passe doit contenir au moins 8 caractères',
  'users.passwordComplexity': 'Le mot de passe doit contenir des majuscules, des minuscules et des chiffres',
  'users.passwordsDontMatch': 'Les mots de passe ne correspondent pas',
  'users.userInformation': "Informations de l'utilisateur",
  'users.forClinic': 'pour {{clinicName}}',
  'users.systemAdminInformation': "Informations de l'administrateur système",
  'users.editUser': "Modifier l'utilisateur",
  'users.updateUser': "Mettre à jour l'utilisateur",
  'users.updateSystemAdmin': "Mettre à jour l'administrateur système",
  'users.updating': 'Mise à jour...',
  'users.userUpdatedSuccess': 'Utilisateur mis à jour avec succès !',
  'users.failedUpdateUser': "Échec de la mise à jour de l'utilisateur. Veuillez réessayer.",
  'users.systemAdminCreatedSuccess': 'Administrateur système créé avec succès !',
  'users.failedCreateSystemAdmin': "Échec de la création de l'administrateur système. Veuillez réessayer.",
  'users.systemAdminUpdatedSuccess': 'Administrateur système mis à jour avec succès !',
  'users.failedUpdateSystemAdmin': "Échec de la mise à jour de l'administrateur système. Veuillez réessayer.",
  'users.doctorRoleCannotChange': 'Le rôle de médecin ne peut pas être modifié',
  'users.selectRole': 'Sélectionner un rôle',
  'users.doctor': 'Médecin',
  'users.thName': 'Nom',
  'users.thEmail': 'E-mail',
  'users.thUsername': "Nom d'utilisateur",
  'users.thPhone': 'Téléphone',
  'users.thDepartment': 'Département',
  'users.thStatus': 'Statut',
  'users.thActions': 'Actions',
  'users.noAdminsFoundFor': 'Aucun administrateur trouvé pour {{clinicName}}',
  'users.noClinicAdminsFound': 'Aucun administrateur de clinique trouvé',
  'users.noSystemAdminsFound': 'Aucun administrateur système trouvé',
  'users.editAdmin': "Modifier l'administrateur",
  'users.deactivateAdmin': "Désactiver l'administrateur",
  'users.activateAdmin': "Activer l'administrateur",
};
