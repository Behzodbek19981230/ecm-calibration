'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Language, translations, companyInfo } from './i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations['uz'];
  company: typeof companyInfo;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('ru');

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang,
      t: translations[lang],
      company: companyInfo,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
