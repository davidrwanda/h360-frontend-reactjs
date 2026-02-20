import { commonEn } from './common';
import { authEn } from './auth';
import { dashboardEn } from './dashboard';
import { landingEn } from './landing';
import { settingsEn } from './settings';
import { clinicEn } from './clinic';
import { users } from './users';
import { navigation } from './navigation';
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
};
