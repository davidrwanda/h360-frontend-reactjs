import type { UserRole } from './auth';
import { IconType } from 'react-icons';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: IconType;
  roles?: UserRole[]; // If undefined, accessible to all authenticated users
  children?: NavigationItem[];
  badge?: number;
}

export type NavigationConfig = NavigationItem[];
