import type { Dictionary } from '../../types';

export const queueFr: Dictionary = {
  // Page
  'queue.queueManagement': 'Gestion de la file d\'attente',
  'queue.manageQueueDesc': 'Surveillez et gérez les files d\'attente des patients en temps réel',

  // Table columns
  'queue.position': '#',
  'queue.patient': 'Patient',
  'queue.doctor': 'Médecin',
  'queue.service': 'Service',
  'queue.checkInTime': 'Heure d\'arrivée',
  'queue.waitTime': 'Temps d\'attente',
  'queue.status': 'Statut',
  'queue.actions': 'Actions',

  // Actions
  'queue.checkIn': 'Enregistrer',
  'queue.startConsultation': 'Démarrer',
  'queue.complete': 'Terminer',
  'queue.markNoShow': 'Absent',
  'queue.cancel': 'Annuler',

  // Stats
  'queue.totalInQueue': 'Total en file',
  'queue.checkedInCount': 'Enregistrés',
  'queue.inProgressCount': 'En cours',
  'queue.completedToday': 'Terminés aujourd\'hui',
  'queue.avgWaitTime': 'Temps d\'attente moy.',

  // States
  'queue.noPatientsInQueue': 'Aucun patient dans la file',
  'queue.queueEmptyDesc': 'Lorsque les patients s\'enregistrent, ils apparaîtront ici.',
  'queue.loadingQueue': 'Chargement de la file...',

  // Filters
  'queue.selectDoctor': 'Sélectionner un médecin',
  'queue.allDoctors': 'Tous les médecins',
  'queue.filterByStatus': 'Filtrer par statut',
  'queue.allStatuses': 'Tous les statuts',

  // Toasts
  'queue.checkInSuccess': 'Patient enregistré avec succès',
  'queue.checkInFailed': 'Échec de l\'enregistrement du patient',
  'queue.statusUpdateSuccess': 'Statut mis à jour avec succès',
  'queue.statusUpdateFailed': 'Échec de la mise à jour du statut',
  'queue.positionUpdateSuccess': 'Position dans la file mise à jour',
  'queue.positionUpdateFailed': 'Échec de la mise à jour de la position',

  // Badge
  'queue.guest': 'Invité',

  // Units
  'queue.minutesShort': 'min',
};
