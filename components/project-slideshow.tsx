"use client";
import { useLanguage } from "./language-provider";
import { assetPath } from "../lib/site-assets";

import { useCallback, useEffect, useRef, useState } from "react";

const photoNumbers: Record<string, number[]> = {
  tube_well_donation: Array.from({ length: 12 }, (_, i) => i + 18),
  rice_bag_donation: [7, 8, 9, 10, 11],
  iftar_food_donation: [1, 2, 3, 4, 5, 6],
  nutrient_yoghurt_donation: [13, 14, 15, 16, 17],
  community_water_well_donation: [12],
};

export default function ProjectSlideshow({ image, category, title }: { image: string; category: string; title: string }) {
 const { t } = useLanguage();

  const folder = image.split("/")[0];
  const images = (photoNumbers[folder] ?? [Number(image.split("/")[1].split(".")[0])]).map(n => assetPath(`/images/${folder}/${n}.webp`));
  const initial = Math.max(0, images.indexOf(assetPath(`/images/${image.replace(/\.(png|jpe?g)$/i, ".webp")}`)));
  const [frame, setFrame] = useState({ index: initial, revision: 0 });
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const request = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let intersecting = false;
    const sync = () => setVisible(intersecting && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; sync(); });
    if (root.current) observer.observe(root.current);
    document.addEventListener("visibilitychange", sync);
    return () => { mounted.current = false; observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);

  const select = useCallback(async (index: number) => {
    const ticket = ++request.current;
    const next = new Image();
    next.src = assetPath(`/images/${folder}/${photoNumbers[folder]?.[index] ?? Number(image.split("/")[1].split(".")[0])}.webp`);
    try { await next.decode(); } catch { return; }
    if (mounted.current && ticket === request.current) setFrame(old => ({ index, revision: old.revision + 1 }));
  }, [folder, image]);

  useEffect(() => {
    if (!visible || images.length < 2) return;
    const next = (frame.index + 1) % images.length;
    const preload = new Image();
    preload.src = images[next];
    const timer = window.setTimeout(() => void select(next), 4000);
    return () => window.clearTimeout(timer);
  }, [visible, frame.index, frame.revision, folder, select, images.length]);

  return <div ref={root} className="programme-image project-slideshow" role="region" aria-roledescription={images.length > 1 ? "carousel" : undefined} aria-label={`${title} ${t("project photographs")}`}>
    <div className="project-slides">{images.map((src, index) => <img key={src} loading="lazy" decoding="async" className={index === frame.index ? "is-active" : ""} src={src} alt={index === frame.index ? `${category} ${t("project photograph")}` : ""} aria-hidden={index !== frame.index}/>)}</div>
    <span className="project-category">{category}</span>
    {images.length > 1 && <div className="project-dots" role="group" aria-label={t("Select project photograph")}>{images.map((src, index) => <button key={src} type="button" className={index === frame.index ? "is-active" : ""} aria-label={`${t("Show")} ${title} — ${t("photo")} ${index + 1}`} aria-pressed={index === frame.index} onClick={() => void select(index)}><span/></button>)}</div>}
  </div>;
}
