import { commonRw } from './common';
import { authRw } from './auth';
import { dashboardRw } from './dashboard';
import { landingRw } from './landing';
import type { Dictionary } from '../../types';

export const rw: Dictionary = {
  ...commonRw,
  ...authRw,
  ...dashboardRw,
  ...landingRw,
};
