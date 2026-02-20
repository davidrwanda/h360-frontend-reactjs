import { commonFr } from './common';
import { authFr } from './auth';
import { dashboardFr } from './dashboard';
import { landingFr } from './landing';
import { settingsFr } from './settings';
import { clinicFr } from './clinic';
import { users } from './users';
import { navigation } from './navigation';
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
};
