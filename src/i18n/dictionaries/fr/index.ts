import { commonFr } from './common';
import { authFr } from './auth';
import { dashboardFr } from './dashboard';
import { landingFr } from './landing';
import { settingsFr } from './settings';
import { clinicFr } from './clinic';
import { users } from './users';
import { navigation } from './navigation';
import { patientFr } from './patient';
import { doctorFr } from './doctor';
import { serviceFr } from './service';
import { activityLogFr } from './activityLog';
import { appointmentFr } from './appointment';
import { profileFr } from './profile';
import { timetableFr } from './timetable';
import { queueFr } from './queue';
import type { Dictionary } from '../../types';

export const fr: Dictionary = {
  ...commonFr,
  ...authFr,
  ...dashboardFr,
  ...landingFr,
  ...settingsFr,
  ...clinicFr,
  ...users,
  ...navigation,
  ...patientFr,
  ...doctorFr,
  ...serviceFr,
  ...activityLogFr,
  ...appointmentFr,
  ...profileFr,
  ...timetableFr,
  ...queueFr,
};
