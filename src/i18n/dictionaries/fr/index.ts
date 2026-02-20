import { commonFr } from './common';
import { authFr } from './auth';
import { dashboardFr } from './dashboard';
import { landingFr } from './landing';
import type { Dictionary } from '../../types';

export const fr: Dictionary = {
  ...commonFr,
  ...authFr,
  ...dashboardFr,
  ...landingFr,
};
