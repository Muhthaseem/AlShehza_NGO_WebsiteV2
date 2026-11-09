"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ExternalLink, Languages, Moon, Search, Sun, X } from "lucide-react";

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
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggested, setSuggested] = useState(["en", "si", "ta"]);
  const [message, setMessage] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
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
    return () => window.removeEventListener("storage", sync);
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
    if (code === "en") { setMessage("This website’s original language is English."); return; }
    const url = new URL(window.location.href);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]") {
      setMessage("Google needs a public website URL to translate this page. This will work after the website is published. For local preview, use your browser’s Translate option.");
      return;
    }
    url.hash = "";
    const target = new URL("https://translate.google.com/translate");
    target.search = new URLSearchParams({ sl: "en", tl: code, hl: "en", u: url.href }).toString();
    window.open(target.href, "_blank", "noopener,noreferrer");
    setMessage(`Opening the ${englishNames.of(code)} translation in Google Translate.`);
  }

  const matches = languages.filter(language => normalise(`${language.name} ${language.native} ${language.code}`).includes(normalise(query.trim())));
  const recommendations = suggested.map(code => languages.find(language => language.code === code)).filter(language => language !== undefined);
  const item = (language: typeof languages[number]) => <li key={language.code}><button type="button" onClick={() => translate(language.code)}><span><strong>{language.name}</strong><small lang={language.code}>{language.native}</small></span>{language.code === "en" ? <Check size={15}/> : <ExternalLink size={13}/>}</button></li>;

  return <div className="header-preferences notranslate" translate="no" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button type="button" className="preference-button theme-toggle" onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} aria-pressed={dark} title={dark ? "Light theme" : "Dark theme"}>{dark ? <Sun size={19}/> : <Moon size={19}/>}</button>
    <button type="button" ref={trigger} className={`preference-button language-toggle ${open ? "selected" : ""}`} onClick={() => { setOpen(!open); setQuery(""); setMessage(""); }} aria-label="Choose website language" aria-expanded={open} aria-controls="language-picker" aria-haspopup="dialog" title="Choose language"><Languages size={19}/><span>EN</span></button>
    {open && <div id="language-picker" className="language-picker" role="dialog" aria-label="Choose a language"><div className="language-heading"><div><strong>Choose your language</strong><p>Explore our work in your language.</p></div><button type="button" onClick={() => { setOpen(false); trigger.current?.focus(); }} aria-label="Close language selector"><X size={17}/></button></div><label className="language-search"><Search size={16}/><input ref={search} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search languages…" aria-label="Search languages" autoComplete="off"/></label><div className="language-results">{!query.trim() && <><p className="language-group-label">SUGGESTED FOR YOU</p><ul>{recommendations.map(item)}</ul></>}<p className="language-group-label">{query.trim() ? `${matches.length} LANGUAGES FOUND` : "ALL LANGUAGES"}</p><ul>{matches.map(item)}</ul>{matches.length === 0 && <p className="language-empty">No matching languages. Try another name.</p>}</div>{message && <p className="language-message" role="status">{message}</p>}<div className="language-footer"><span>Translation via Google Translate</span><small>Translations open in a new tab.</small></div></div>}
  </div>;
}
