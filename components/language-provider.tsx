"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { translateText, type LocalLanguage } from "../lib/local-translations";
import { getTranslationContext } from "../lib/translation-navigation";

const isLocal = (value: string | null): value is LocalLanguage => value === "en" || value === "ta" || value === "si";
const LanguageContext = createContext({ language: "en" as LocalLanguage, setLanguage: (_language: LocalLanguage) => {}, t: (text: string) => text });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, updateLanguage] = useState<LocalLanguage>("en");
  const apply = useCallback((next: LocalLanguage) => {
    updateLanguage(next);
    document.documentElement.lang = next;
    document.documentElement.dir = "ltr";
    document.title = next === "ta" ? "அல் ஷெஹ்ஸா அமைப்பு | செயலில் கருணை" : next === "si" ? "අල් ෂෙහ්සා පදනම | කරුණාව ක්‍රියාවට" : "Al Shehza Foundation | Compassion in Action";
  }, []);

  useEffect(() => {
    const restore = () => {
      try {
        if (getTranslationContext(window.location.href).translated) { updateLanguage("en"); return; }
        const query = new URLSearchParams(window.location.search).get("lang");
        const saved = localStorage.getItem("al-shehza-language");
        apply(isLocal(query) ? query : isLocal(saved) ? saved : "en");
      } catch {
        const query = new URLSearchParams(window.location.search).get("lang");
        apply(isLocal(query) ? query : "en");
      }
    };
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [apply]);

  const setLanguage = useCallback((next: LocalLanguage) => {
    apply(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState(null, "", url);
    try { localStorage.setItem("al-shehza-language", next); } catch { /* URL still persists the selection. */ }
  }, [apply]);
  const t = useCallback((text: string) => translateText(text, language), [language]);
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
