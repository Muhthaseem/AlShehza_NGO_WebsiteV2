"use client";
import { assetPath } from "../lib/site-assets";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, HeartHandshake } from "lucide-react";

const groups = [
  { folder: "tube_well_donation", numbers: Array.from({ length: 12 }, (_, i) => i + 18), label: "Household water access" },
  { folder: "rice_bag_donation", numbers: [7, 8, 9, 10, 11], label: "Rice donations" },
  { folder: "iftar_food_donation", numbers: [1, 2, 3, 4, 5, 6], label: "Iftar food donations" },
  { folder: "nutrient_yoghurt_donation", numbers: [13, 14, 15, 16, 17], label: "Food support for children" },
  { folder: "community_water_well_donation", numbers: [12], label: "Community water facilities" },
];
// Interleave programmes so every part of the foundation's work appears early.
const slides = Array.from({ length: 12 }, (_, i) => groups.flatMap(group => group.numbers[i] === undefined ? [] : [{ ...group, src: assetPath(`/images/${group.folder}/${group.numbers[i]}.webp`) }])).flat();
const duration = 4000;

export default function HeroSlideshow() {
  const [frame, setFrame] = useState({ current: 0, previous: 0, sequence: 0 });
  const [visible, setVisible] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const request = useRef(0);
  const mounted = useRef(true);
  const slide = slides[frame.current];
  const running = visible;

  useEffect(() => {
    mounted.current = true;
    let intersecting = true;
    const visibility = () => setVisible(intersecting && !document.hidden);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; visibility(); });
    if (root.current) observer.observe(root.current);
    return () => { mounted.current = false; document.removeEventListener("visibilitychange", visibility); observer.disconnect(); };
  }, []);

  const move = useCallback(async (direction: number) => {
    const target = (frame.current + direction + slides.length) % slides.length;
    const ticket = ++request.current;
    const image = new Image();
    image.src = slides[target].src;
    try { await image.decode(); } catch { return; }
    if (!mounted.current || ticket !== request.current) return;
    setFrame(old => ({ current: target, previous: old.current, sequence: old.sequence + 1 }));
  }, [frame.current]);

  useEffect(() => {
    const next = new Image();
    next.src = slides[(frame.current + 1) % slides.length].src;
    if (!running) return;
    const timer = window.setTimeout(() => void move(1), duration);
    return () => window.clearTimeout(timer);
  }, [frame.current, frame.sequence, running, move]);

  return <div ref={root} className={`hero-visual hero-slideshow ${running ? "is-playing" : "is-paused"}`} role="region" aria-roledescription="carousel" aria-label="Foundation project photographs">
    <div className="hero-slides" aria-hidden="true">
      <img className="hero-slide-previous" src={slides[frame.previous].src} alt=""/>
      <div key={frame.sequence} className="hero-slide-current"><img src={slide.src} alt="" fetchPriority={frame.sequence === 0 ? "high" : "auto"}/></div>
    </div>
    <div className="photo-shade"/>
    <span className="image-label"><span className="dot"/>COMPASSION, IN EVERYDAY LIFE</span>
    <div className="hero-slide-category" aria-live={running ? "off" : "polite"} aria-atomic="true">{slide.label}</div>
    <div className="hero-photo-caption"><span>Every act of care.<br/>A shared humanity.</span><a href="#work" aria-label="Explore our programmes"><ArrowUpRight size={28}/></a></div>
    <div className="floating-note"><HeartHandshake size={27} strokeWidth={1.4}/><span>Compassion in action.<br/><strong>Dignity for all.</strong></span></div>
  </div>;
}
