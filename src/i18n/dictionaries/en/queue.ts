import type { Dictionary } from '../../types';

export const queueEn: Dictionary = {
  // Page
  'queue.queueManagement': 'Queue Management',
  'queue.manageQueueDesc': 'Monitor and manage patient queues in real-time',

  // Table columns
  'queue.position': '#',
  'queue.patient': 'Patient',
  'queue.doctor': 'Doctor',
  'queue.service': 'Service',
  'queue.checkInTime': 'Check-in Time',
  'queue.waitTime': 'Wait Time',
  'queue.status': 'Status',
  'queue.actions': 'Actions',

  // Actions
  'queue.checkIn': 'Check In',
  'queue.startConsultation': 'Start',
  'queue.complete': 'Complete',
  'queue.markNoShow': 'No Show',
  'queue.cancel': 'Cancel',

  // Stats
  'queue.totalInQueue': 'Total in Queue',
  'queue.checkedInCount': 'Checked In',
  'queue.inProgressCount': 'In Progress',
  'queue.completedToday': 'Completed Today',
  'queue.avgWaitTime': 'Avg. Wait Time',

  // States
  'queue.noPatientsInQueue': 'No patients in queue',
  'queue.queueEmptyDesc': 'When patients check in, they will appear here.',
  'queue.loadingQueue': 'Loading queue...',

  // Filters
  'queue.selectDoctor': 'Select Doctor',
  'queue.allDoctors': 'All Doctors',
  'queue.filterByStatus': 'Filter by Status',
  'queue.allStatuses': 'All Statuses',

  // Toasts
  'queue.checkInSuccess': 'Patient checked in successfully',
  'queue.checkInFailed': 'Failed to check in patient',
  'queue.statusUpdateSuccess': 'Status updated successfully',
  'queue.statusUpdateFailed': 'Failed to update status',
  'queue.positionUpdateSuccess': 'Queue position updated',
  'queue.positionUpdateFailed': 'Failed to update queue position',

  // Badge
  'queue.guest': 'Guest',

  // Units
  'queue.minutesShort': 'min',
};
