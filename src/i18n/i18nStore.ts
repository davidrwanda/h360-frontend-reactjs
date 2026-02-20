import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SupportedLang, Dictionary } from './types';
import { DEFAULT_LANG } from './types';
import { en } from './dictionaries/en';
import { fr } from './dictionaries/fr';
import { rw } from './dictionaries/rw';

const dictionaries: Record<SupportedLang, Dictionary> = { en, fr, rw };

interface I18nStore {
  lang: SupportedLang;
  dictionary: Dictionary;
  setLang: (lang: SupportedLang) => void;
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      lang: DEFAULT_LANG,
      dictionary: dictionaries[DEFAULT_LANG],
      setLang: (lang: SupportedLang) =>
        set({
          lang,
          dictionary: dictionaries[lang],
        }),
    }),
    {
      name: 'h360-i18n-storage',
      partialize: (state) => ({ lang: state.lang }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<I18nStore> | undefined;
        const lang = persistedState?.lang || current.lang;
        return {
          ...current,
          lang,
          dictionary: dictionaries[lang],
        };
      },
    },
  ),
);
