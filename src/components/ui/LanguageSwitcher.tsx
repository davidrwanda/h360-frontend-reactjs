import { useState, useRef, useEffect } from 'react';
import { useTranslation, LANG_META, SUPPORTED_LANGS } from '@/i18n';
import type { SupportedLang } from '@/i18n';
import { MdLanguage } from 'react-icons/md';

interface LanguageSwitcherProps {
  variant?: 'default' | 'light';
}

export const LanguageSwitcher = ({ variant = 'default' }: LanguageSwitcherProps) => {
  const { lang, setLang } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isLight = variant === 'light';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 ${
          isLight
            ? 'text-white/80 hover:text-white hover:bg-white/10 focus-visible:ring-white/30'
            : 'text-carbon/70 hover:text-azure-dragon hover:bg-white-smoke focus-visible:ring-azure-dragon/30'
        }`}
        aria-label="Change language"
      >
        <MdLanguage className="h-4 w-4" />
        <span>{LANG_META[lang].nativeLabel}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-40 rounded-md border border-carbon/10 bg-white shadow-xl z-50">
          <div className="p-1">
            {SUPPORTED_LANGS.map((code) => (
              <button
                key={code}
                onClick={() => {
                  setLang(code as SupportedLang);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  code === lang
                    ? 'bg-azure-dragon/10 text-azure-dragon font-medium'
                    : 'text-carbon/80 hover:bg-white-smoke'
                }`}
              >
                <span className="text-xs font-mono uppercase text-carbon/40">{code}</span>
                <span>{LANG_META[code as SupportedLang].nativeLabel}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
