import { commonEn } from './common';
import { authEn } from './auth';
import { dashboardEn } from './dashboard';
import { landingEn } from './landing';
import { settingsEn } from './settings';
import { clinicEn } from './clinic';
import { users } from './users';
import { navigation } from './navigation';
import { patientEn } from './patient';
import { doctorEn } from './doctor';
import { serviceEn } from './service';
import { activityLogEn } from './activityLog';
import { appointmentEn } from './appointment';
import { profileEn } from './profile';
import { timetableEn } from './timetable';
import { queueEn } from './queue';
import { organizationEn } from './organization';
import type { Dictionary } from '../../types';

export const en: Dictionary = {
  ...commonEn,
  ...authEn,
  ...dashboardEn,
  ...landingEn,
  ...settingsEn,
  ...clinicEn,
  ...users,
  ...navigation,
  ...patientEn,
  ...doctorEn,
  ...serviceEn,
  ...activityLogEn,
  ...appointmentEn,
  ...profileEn,
  ...timetableEn,
  ...queueEn,
  ...organizationEn,
};
