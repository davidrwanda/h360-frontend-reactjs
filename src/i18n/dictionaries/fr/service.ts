import type { Dictionary } from '../../types';

export const serviceFr: Dictionary = {
  // Page header
  'service.services_management': 'Gestion des Services',
  'service.manage_clinic_services': 'Gérer les services de votre clinique',
  'service.create_service': 'Créer un Service',
  'service.create_new_service': 'Créer un Nouveau Service',
  'service.add_service_desc': 'Ajouter un nouveau service à la clinique',
  'service.edit_service': 'Modifier le Service',
  'service.update_service_info': 'Mettre à jour les informations du service',
  'service.service_details': 'Détails du Service',

  // Filters
  'service.filters': 'Filtres',
  'service.show_advanced': 'Afficher Avancé',
  'service.hide_advanced': 'Masquer Avancé',
  'service.search': 'Rechercher',
  'service.search_placeholder': 'Rechercher par nom ou code...',
  'service.status': 'Statut',
  'service.all_status': 'Tous les Statuts',
  'service.active': 'Actif',
  'service.inactive': 'Inactif',
  'service.category': 'Catégorie',
  'service.category_placeholder': 'Filtrer par catégorie',
  'service.requires_appointment': 'Rendez-vous Requis',
  'service.all': 'Tous',
  'service.yes': 'Oui',
  'service.no': 'Non',
  'service.clear_filters': 'Effacer',

  // Table
  'service.service_code': 'Code du Service',
  'service.name': 'Nom',
  'service.price': 'Prix',
  'service.duration': 'Durée',
  'service.duration_min': '{{minutes}} min',
  'service.actions': 'Actions',
  'service.no_services_found': 'Aucun service trouvé',
  'service.failed_to_load': 'Échec du chargement des services',
  'service.activate_service_tooltip': 'Activer le service',

  // Pagination
  'service.page_of': 'Page {{page}} sur {{totalPages}}',
  'service.previous': 'Précédent',
  'service.next': 'Suivant',

  // Deactivate/Activate modals
  'service.deactivate_title': 'Désactiver le Service',
  'service.deactivate_message': 'Êtes-vous sûr de vouloir désactiver "{{name}}" ? Cette action peut être annulée ultérieurement.',
  'service.deactivate': 'Désactiver',
  'service.activate_title': 'Activer le Service',
  'service.activate_message': 'Êtes-vous sûr de vouloir activer "{{name}}" ?',
  'service.activate': 'Activer',

  // Detail page
  'service.service_information': 'Informations du Service',
  'service.service_not_found': 'Service Non Trouvé',
  'service.service_not_found_desc': "Le service que vous recherchez n'existe pas ou a été supprimé.",
  'service.back': 'Retour',
  'service.clinic': 'Clinique',
  'service.max_daily_capacity': 'Capacité Max Journalière',
  'service.appointment_type': 'Type de Rendez-vous',
  'service.requires_appointment_label': 'Rendez-vous Requis',
  'service.walk_in_available': 'Sans Rendez-vous Disponible',
  'service.description': 'Description',
  'service.assigned_doctors': 'Médecins Assignés',
  'service.unknown_doctor': 'Médecin Inconnu',
  'service.custom_price': 'Prix personnalisé',
  'service.custom_duration': 'Durée personnalisée',

  // Create/Edit form
  'service.service_name': 'Nom du Service',
  'service.service_name_placeholder': 'Entrez le nom du service',
  'service.service_name_required': 'Le nom du service est requis',
  'service.service_code_label': 'Code du Service',
  'service.service_code_placeholder': 'Entrez le code du service',
  'service.service_code_required': 'Le code du service est requis',
  'service.description_placeholder': 'Entrez la description du service',
  'service.category_select_placeholder': 'Sélectionnez ou tapez une catégorie',
  'service.price_placeholder': 'Entrez le prix',
  'service.price_required': 'Le prix doit être un nombre positif',
  'service.duration_label': 'Durée (minutes)',
  'service.duration_min_error': "La durée doit être d'au moins 1 minute",
  'service.max_daily_capacity_label': 'Capacité Max Journalière',
  'service.walk_in_allowed': 'Sans Rendez-vous Autorisé',
  'service.clinic_required': 'La clinique est requise',

  // Form actions
  'service.creating': 'Création...',
  'service.created_success': 'Service créé avec succès !',
  'service.create_failed': 'Échec de la création du service. Veuillez réessayer.',
  'service.updating': 'Mise à jour...',
  'service.update_service': 'Mettre à Jour le Service',
  'service.updated_success': 'Service mis à jour avec succès !',
  'service.update_failed': 'Échec de la mise à jour du service. Veuillez réessayer.',
  'service.cancel': 'Annuler',

  // Access control
  'service.access_denied': 'Accès Refusé',
  'service.access_denied_create': "Vous n'avez pas la permission de créer des services.",
  'service.access_denied_edit': "Vous n'avez pas la permission de modifier des services.",
  'service.clinic_required_page': 'Clinique Requise',
  'service.clinic_required_desc': 'Vous devez être associé à une clinique pour gérer les services.',
};
