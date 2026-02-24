export const QUEUE = {
  // Page
  QUEUE_MANAGEMENT: 'queue.queueManagement',
  MANAGE_QUEUE_DESC: 'queue.manageQueueDesc',

  // Table columns
  POSITION: 'queue.position',
  PATIENT: 'queue.patient',
  DOCTOR: 'queue.doctor',
  SERVICE: 'queue.service',
  CHECK_IN_TIME: 'queue.checkInTime',
  WAIT_TIME: 'queue.waitTime',
  STATUS: 'queue.status',
  ACTIONS: 'queue.actions',

  // Actions
  CHECK_IN: 'queue.checkIn',
  START_CONSULTATION: 'queue.startConsultation',
  COMPLETE: 'queue.complete',
  MARK_NO_SHOW: 'queue.markNoShow',
  CANCEL: 'queue.cancel',

  // Stats
  TOTAL_IN_QUEUE: 'queue.totalInQueue',
  CHECKED_IN_COUNT: 'queue.checkedInCount',
  IN_PROGRESS_COUNT: 'queue.inProgressCount',
  COMPLETED_TODAY: 'queue.completedToday',
  AVG_WAIT_TIME: 'queue.avgWaitTime',

  // States
  NO_PATIENTS_IN_QUEUE: 'queue.noPatientsInQueue',
  QUEUE_EMPTY_DESC: 'queue.queueEmptyDesc',
  LOADING_QUEUE: 'queue.loadingQueue',

  // Filters
  SELECT_DOCTOR: 'queue.selectDoctor',
  ALL_DOCTORS: 'queue.allDoctors',
  FILTER_BY_STATUS: 'queue.filterByStatus',
  ALL_STATUSES: 'queue.allStatuses',

  // Toasts
  CHECK_IN_SUCCESS: 'queue.checkInSuccess',
  CHECK_IN_FAILED: 'queue.checkInFailed',
  STATUS_UPDATE_SUCCESS: 'queue.statusUpdateSuccess',
  STATUS_UPDATE_FAILED: 'queue.statusUpdateFailed',
  POSITION_UPDATE_SUCCESS: 'queue.positionUpdateSuccess',
  POSITION_UPDATE_FAILED: 'queue.positionUpdateFailed',

  // Badge
  GUEST: 'queue.guest',

  // Units
  MINUTES_SHORT: 'queue.minutesShort',
} as const;
