import { createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import { useI18nStore } from './i18nStore';
import { interpolate } from './interpolate';
import type { SupportedLang } from './types';

interface I18nContextValue {
  t: (key: string, params?: Record<string, string | number>) => string;
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const { lang, dictionary, setLang } = useI18nStore();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const template = dictionary[key];
      if (!template) {
        if (import.meta.env.DEV) {
          console.warn(`[i18n] Missing translation: "${key}" for lang "${lang}"`);
        }
        return key;
      }
      return interpolate(template, params);
    },
    [dictionary, lang],
  );

  const value = useMemo(() => ({ t, lang, setLang }), [t, lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useTranslation = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return ctx;
};
