"use client";
import { useLanguage } from "./language-provider";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Languages, Moon, Search, Sun, X } from "lucide-react";
import { getTranslationContext, getTranslationDestination } from "../lib/translation-navigation";

const codes = "en si ta hi ur bn ar fr de es pt it nl ru uk pl tr el he fa ps ne mr gu kn ml te pa th vi id ms fil zh-CN zh-TW ja ko sw af am az be bg bs ca cs cy da et eu fi ga gl ha hr hu hy is ka kk km ku ky lo lt lv mk mn my no ro sk sl so sq sr su sv tg tk uz yi yo zu".split(" ");
const englishNames = new Intl.DisplayNames(["en"], { type: "language" });
const languages = codes.map(code => {
  const name = englishNames.of(code) ?? code;
  let native = name;
  try { native = new Intl.DisplayNames([code], { type: "language" }).of(code) ?? name; } catch { /* Keep the English name on older browsers. */ }
  return { code, name, native };
}).sort((a, b) => a.name.localeCompare(b.name, "en"));
const normalise = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function HeaderPreferences() {
 const { t, language: localLanguage, setLanguage } = useLanguage();

  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggested, setSuggested] = useState(["en", "si", "ta"]);
  const [message, setMessage] = useState("");
  const [activeLanguage, setActiveLanguage] = useState("en");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { if (!getTranslationContext(window.location.href).translated) setActiveLanguage(localLanguage); } catch { setActiveLanguage(localLanguage); }
  }, [localLanguage]);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
    // Google website translation may indicate its language in the proxy URL.
    const html = document.documentElement;
    let translatedLanguage: string | null = null;
    try {
      const context = getTranslationContext(window.location.href);
      translatedLanguage = context.translated ? context.language : null;
      setActiveLanguage(codes.find(code => code.toLowerCase() === context.language.toLowerCase()) ?? "en");
    } catch { /* Keep the original-language controls available for malformed URLs. */ }
    if (translatedLanguage && /^[a-z]{2,3}(?:-[a-zA-Z]{2,8})*$/.test(translatedLanguage)) html.lang = translatedLanguage;
    const syncDirection = () => {
      const language = html.lang.toLowerCase().split("-")[0];
      html.dir = ["ar", "fa", "he", "ur", "ps", "ku", "yi", "sd", "dv"].includes(language) ? "rtl" : "ltr";
    };
    syncDirection();
    const directionObserver = new MutationObserver(syncDirection);
    directionObserver.observe(html, { attributes: true, attributeFilter: ["lang"] });
    const sync = (event: StorageEvent) => {
      if (event.key !== "al-shehza-theme") return;
      const next = event.newValue === "dark";
      document.documentElement.dataset.theme = next ? "dark" : "light";
      document.documentElement.style.colorScheme = next ? "dark" : "light";
      setDark(next);
    };
    window.addEventListener("storage", sync);
    const browser = navigator.languages.flatMap(locale => {
      const match = codes.find(code => code.toLowerCase() === locale.toLowerCase()) ?? codes.find(code => code === locale.split("-")[0]);
      return match ? [match] : [];
    });
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const regional = zone === "Asia/Colombo" ? ["si", "ta", "en"] : /Asia\/(Kolkata|Calcutta)/.test(zone) ? ["hi", "ta", "en"] : /Asia\/(Dubai|Riyadh|Qatar|Kuwait|Bahrain|Muscat)/.test(zone) ? ["ar", "en", "ur"] : ["en", "si", "ta"];
    setSuggested(Array.from(new Set([...browser, ...regional])).slice(0, 6));
    return () => { window.removeEventListener("storage", sync); directionObserver.disconnect(); };
  }, []);

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);

  function toggleTheme() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    setDark(next);
    try { localStorage.setItem("al-shehza-theme", next ? "dark" : "light"); } catch { /* Theme still works when storage is disabled. */ }
  }

  function translate(code: string) {
    const url = new URL(window.location.href);
    if (code === activeLanguage) { setMessage("This language is already selected."); return; }
    if (code === "en" || code === "ta" || code === "si") {
      const context = getTranslationContext(url.href);
      if (context.translated) {
        const original = new URL(context.originalUrl);
        original.searchParams.set("lang", code);
        window.location.assign(original.href);
      } else {
        setLanguage(code);
        setActiveLanguage(code);
        setOpen(false);
        setQuery("");
      }
      return;
    }
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]") {
      setMessage("Google needs a public website URL to translate this page. This will work after the website is published. For local preview, use your browser’s Translate option.");
      return;
    }
    try {
      window.location.assign(getTranslationDestination(url.href, code));
    } catch {
      setMessage("We couldn’t switch the language for this page. Try reloading it and selecting the language again.");
    }
  }

  const matches = languages.filter(language => normalise(`${language.name} ${language.native} ${language.code}`).includes(normalise(query.trim())));
  const recommendations = suggested.map(code => languages.find(language => language.code === code)).filter(language => language !== undefined);
  const item = (language: typeof languages[number]) => <li key={language.code}><button type="button" onClick={() => translate(language.code)} aria-pressed={language.code === activeLanguage}><span><strong>{language.name}</strong><small lang={language.code}>{language.native}</small></span>{language.code === activeLanguage ? <Check size={15}/> : <ArrowRight size={13}/>}</button></li>;

  return <div className="header-preferences notranslate" translate="no" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button type="button" className="preference-button theme-toggle" onClick={toggleTheme} aria-label={dark ? t("Switch to light theme") : t("Switch to dark theme")} aria-pressed={dark} title={dark ? t("Light theme") : t("Dark theme")}>{dark ? <Sun size={19}/> : <Moon size={19}/>}</button>
    <button type="button" ref={trigger} className={`preference-button language-toggle ${open ? "selected" : ""}`} onClick={() => { setOpen(!open); setQuery(""); setMessage(""); }} aria-label={t("Choose website language")} aria-expanded={open} aria-controls="language-picker" aria-haspopup="dialog" title={t("Choose language")}><Languages size={19}/><span>{activeLanguage.split("-")[0].toUpperCase()}</span></button>
    {open && <div id="language-picker" className="language-picker" role="dialog" aria-label={t("Choose a language")}><div className="language-heading"><div><strong>{t("Choose your language")}</strong><p>{t("Explore our work in your language.")}</p></div><button type="button" onClick={() => { setOpen(false); trigger.current?.focus(); }} aria-label={t("Close language selector")}><X size={17}/></button></div><label className="language-search"><Search size={16}/><input ref={search} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t("Search languages…")} aria-label={t("Search languages")} autoComplete="off"/></label><div className="language-results">{!query.trim() && <><p className="language-group-label">{t("SUGGESTED FOR YOU")}</p><ul>{recommendations.map(item)}</ul></>}<p className="language-group-label">{query.trim() ? `${matches.length} ${t("LANGUAGES FOUND")}` : t("ALL LANGUAGES")}</p><ul>{matches.map(item)}</ul>{matches.length === 0 && <p className="language-empty">{t("No matching languages. Try another name.")}</p>}</div>{message && <p className="language-message" role="status">{t(message)}</p>}<div className="language-footer"><span>{t("Tamil and Sinhala are available on this site. Other languages use Google Translate.")}</span><small>{t("Switch languages in this tab, including back to English.")}</small></div></div>}
  </div>;
}
