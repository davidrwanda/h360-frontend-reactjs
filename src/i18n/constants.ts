import type { SupportedLang } from './types';

export interface LangMeta {
  code: SupportedLang;
  label: string;
  nativeLabel: string;
}

export const LANG_META: Record<SupportedLang, LangMeta> = {
  en: { code: 'en', label: 'English', nativeLabel: 'English' },
  fr: { code: 'fr', label: 'French', nativeLabel: 'Français' },
  rw: { code: 'rw', label: 'Kinyarwanda', nativeLabel: 'Ikinyarwanda' },
};
