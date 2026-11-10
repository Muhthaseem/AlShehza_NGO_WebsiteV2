"use client";
import { useLanguage } from "./language-provider";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const sections = ["home", "work", "story", "community", "contact"];
const links = [{ id: "work", label: "Our work" }, { id: "story", label: "Our story" }, { id: "community", label: "In the community" }];

export default function SectionNavigation({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
 const { t } = useLanguage();

  const [active, setActive] = useState("home");
  const [marker, setMarker] = useState({ left: 0, top: 0, width: 0 });
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const header = document.querySelector("header");
      const readingLine = (header?.getBoundingClientRect().bottom ?? 94) + Math.min(110, window.innerHeight * .16);
      let current = "home";
      for (const id of sections) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= readingLine) current = id;
      }
      // The last section can be shorter than the viewport.
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = "contact";
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    const main = document.querySelector("main"), header = document.querySelector("header");
    if (main) observer.observe(main);
    if (header) observer.observe(header);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    schedule();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); window.removeEventListener("hashchange", schedule); };
  }, []);

  useLayoutEffect(() => {
    const navigation = nav.current;
    if (!navigation) return;
    const measure = () => {
      const link = navigation.querySelector<HTMLElement>(`.nav-section-link[href="#${active}"]`);
      if (!link || !navigation.getBoundingClientRect().width) { setMarker(old => ({ ...old, width: 0 })); return; }
      const parent = navigation.getBoundingClientRect(), rect = link.getBoundingClientRect();
      setMarker({ left: rect.left - parent.left, top: rect.bottom - parent.top + 7, width: rect.width });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(navigation);
    navigation.querySelectorAll("a").forEach(link => observer.observe(link));
    measure();
    return () => observer.disconnect();
  }, [active, open]);

  return <nav ref={nav} id="navigation" className={open ? "open" : ""} aria-label={t("Main navigation")}>
    {links.map(link => <a key={link.id} className={`nav-section-link ${active === link.id ? "is-current" : ""}`} href={`#${link.id}`} aria-current={active === link.id ? "location" : undefined} onClick={onNavigate}>{t(link.label)}</a>)}
    <a className="button small" href="#contact" aria-current={active === "contact" ? "location" : undefined} onClick={onNavigate}>{t("Get involved")} <ArrowUpRight size={16}/></a>
    <span className="nav-current-marker" aria-hidden="true" style={{ width: marker.width, opacity: marker.width ? 1 : 0, transform: `translate3d(${marker.left}px,${marker.top}px,0)` }}/>
  </nav>;
}
