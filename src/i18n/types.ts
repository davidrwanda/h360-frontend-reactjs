export type SupportedLang = 'en' | 'fr' | 'rw';

export const SUPPORTED_LANGS: readonly SupportedLang[] = ['en', 'fr', 'rw'] as const;

export const DEFAULT_LANG: SupportedLang = 'en';

export type Dictionary = Record<string, string>;
