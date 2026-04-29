import { createContext, createMemo, createSignal, JSX, useContext } from "solid-js";
import { defaultLanguage, dictionaries, type DictionaryKey, type Language } from "./dictionaries";

interface I18nContextValue {
  language: () => Language;
  setLanguage: (language: Language) => void;
  t: (key: DictionaryKey) => string;
}

const LANGUAGE_STORAGE_KEY = "scandium.language.v2";
const I18nContext = createContext<I18nContextValue>();

function readStoredLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "ru" || stored === "en" || stored === "kk" ? stored : defaultLanguage;
}

export function I18nProvider(props: { children: JSX.Element }) {
  const [language, setLanguageSignal] = createSignal<Language>(readStoredLanguage());
  const dictionary = createMemo(() => dictionaries[language()]);

  function setLanguage(nextLanguage: Language) {
    setLanguageSignal(nextLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }

  const value: I18nContextValue = {
    language,
    setLanguage,
    t: (key) => dictionary()[key]
  };

  return (
    <I18nContext.Provider value={value}>
      {props.children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider.");
  }

  return context;
}
