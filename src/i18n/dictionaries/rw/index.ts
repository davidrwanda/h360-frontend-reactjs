import { commonRw } from './common';
import { authRw } from './auth';
import { dashboardRw } from './dashboard';
import { landingRw } from './landing';
import { settingsRw } from './settings';
import { clinicRw } from './clinic';
import { users } from './users';
import { navigation } from './navigation';
import { patientRw } from './patient';
import { doctorRw } from './doctor';
import { serviceRw } from './service';
import { activityLogRw } from './activityLog';
import { appointmentRw } from './appointment';
import { profileRw } from './profile';
import { timetableRw } from './timetable';
import type { Dictionary } from '../../types';

export const rw: Dictionary = {
  ...commonRw,
  ...authRw,
  ...dashboardRw,
  ...landingRw,
  ...settingsRw,
  ...clinicRw,
  ...users,
  ...navigation,
  ...patientRw,
  ...doctorRw,
  ...serviceRw,
  ...activityLogRw,
  ...appointmentRw,
  ...profileRw,
  ...timetableRw,
};
