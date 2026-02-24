import type { Dictionary } from '../../types';

export const queueRw: Dictionary = {
  // Page
  'queue.queueManagement': 'Gucunga umurongo',
  'queue.manageQueueDesc': 'Kurikirana no gucunga imirongo y\'abarwayi mu gihe nyacyo',

  // Table columns
  'queue.position': '#',
  'queue.patient': 'Umurwayi',
  'queue.doctor': 'Umuganga',
  'queue.service': 'Serivisi',
  'queue.checkInTime': 'Igihe yinjiriye',
  'queue.waitTime': 'Igihe cy\'gutegereza',
  'queue.status': 'Imiterere',
  'queue.actions': 'Ibikorwa',

  // Actions
  'queue.checkIn': 'Kwiyandikisha',
  'queue.startConsultation': 'Gutangira',
  'queue.complete': 'Kurangiza',
  'queue.markNoShow': 'Ntiyaje',
  'queue.cancel': 'Guhagarika',

  // Stats
  'queue.totalInQueue': 'Bose mu murongo',
  'queue.checkedInCount': 'Biyandikishije',
  'queue.inProgressCount': 'Barimo gusuzumwa',
  'queue.completedToday': 'Barangiye uyu munsi',
  'queue.avgWaitTime': 'Igihe cyo gutegereza',

  // States
  'queue.noPatientsInQueue': 'Nta murwayi mu murongo',
  'queue.queueEmptyDesc': 'Iyo abarwayi biyandikishije, bazagaragara hano.',
  'queue.loadingQueue': 'Gutegereza umurongo...',

  // Filters
  'queue.selectDoctor': 'Hitamo umuganga',
  'queue.allDoctors': 'Abaganga bose',
  'queue.filterByStatus': 'Shungura ku miterere',
  'queue.allStatuses': 'Imiterere yose',

  // Toasts
  'queue.checkInSuccess': 'Umurwayi yiyandikishije neza',
  'queue.checkInFailed': 'Kwiyandikisha byanze',
  'queue.statusUpdateSuccess': 'Imiterere yahinduwe neza',
  'queue.statusUpdateFailed': 'Guhindura imiterere byanze',
  'queue.positionUpdateSuccess': 'Umwanya mu murongo wahinduwe',
  'queue.positionUpdateFailed': 'Guhindura umwanya mu murongo byanze',

  // Badge
  'queue.guest': 'Umushyitsi',

  // Units
  'queue.minutesShort': 'min',
};
