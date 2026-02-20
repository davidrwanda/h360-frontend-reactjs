import { commonEn } from './common';
import { authEn } from './auth';
import { dashboardEn } from './dashboard';
import { landingEn } from './landing';
import type { Dictionary } from '../../types';

export const en: Dictionary = {
  ...commonEn,
  ...authEn,
  ...dashboardEn,
  ...landingEn,
};
