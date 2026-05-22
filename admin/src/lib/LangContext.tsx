import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations, type Lang, type I18n } from './i18n';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: I18n;
}

const LangContext = createContext<LangContextType>({
  lang: 'uz',
  setLang: () => {},
  t: translations.uz,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('ecm_lang') as Lang) || 'uz',
  );

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem('ecm_lang', l);
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
