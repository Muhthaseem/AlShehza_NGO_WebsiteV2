"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Droplets, HeartHandshake, Pause, Play, Wheat } from "lucide-react";

const groups = [
  { folder: "tube_well_donation", numbers: Array.from({ length: 12 }, (_, i) => i + 18), label: "Household water access", title: "Every drop.", subtitle: "A daily difference.", note: "Closer to water.", promise: "Closer to possibility.", Icon: Droplets },
  { folder: "rice_bag_donation", numbers: [7, 8, 9, 10, 11], label: "Rice donations", title: "A staple for today.", subtitle: "Care for a family.", note: "Everyday essentials.", promise: "Shared with care.", Icon: Wheat },
  { folder: "iftar_food_donation", numbers: [1, 2, 3, 4, 5, 6], label: "Iftar food donations", title: "A meal to share.", subtitle: "A moment together.", note: "Sharing an evening meal.", promise: "Bringing people together.", Icon: HeartHandshake },
  { folder: "nutrient_yoghurt_donation", numbers: [13, 14, 15, 16, 17], label: "Food support for children", title: "Small acts of care.", subtitle: "For growing lives.", note: "Care for children.", promise: "Compassion in practice.", Icon: HeartHandshake },
  { folder: "community_water_well_donation", numbers: [12], label: "Community water facilities", title: "A shared resource.", subtitle: "A community supported.", note: "Water for shared spaces.", promise: "Care for the community.", Icon: Droplets },
];
// Interleave programmes so every part of the foundation's work appears early.
const slides = Array.from({ length: 12 }, (_, i) => groups.flatMap(group => group.numbers[i] === undefined ? [] : [{ ...group, src: `/images/${group.folder}/${group.numbers[i]}.webp` }])).flat();
const duration = 6500;

export default function HeroSlideshow() {
  const [frame, setFrame] = useState({ current: 0, previous: 0, sequence: 0 });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visible, setVisible] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const request = useRef(0);
  const mounted = useRef(true);
  const slide = slides[frame.current];
  const running = !paused && !hovered && !focused && !reducedMotion && visible;

  useEffect(() => {
    mounted.current = true;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    let intersecting = true;
    const visibility = () => setVisible(intersecting && !document.hidden);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; visibility(); });
    if (root.current) observer.observe(root.current);
    return () => { mounted.current = false; media.removeEventListener("change", sync); document.removeEventListener("visibilitychange", visibility); observer.disconnect(); };
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

  const Icon = slide.Icon;
  return <div ref={root} className={`hero-visual hero-slideshow ${running ? "is-playing" : "is-paused"}`} role="region" aria-roledescription="carousel" aria-label="Foundation project photographs" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); void move(event.key === "ArrowRight" ? 1 : -1); } }}>
    <div className="hero-slides" aria-hidden="true">
      <img className="hero-slide-previous" src={slides[frame.previous].src} alt=""/>
      <div key={frame.sequence} className="hero-slide-current"><img src={slide.src} alt="" fetchPriority={frame.sequence === 0 ? "high" : "auto"}/></div>
    </div>
    <div className="photo-shade"/>
    <span className="image-label"><span className="dot"/>COMPASSION, IN EVERYDAY LIFE</span>
    <div className="hero-slide-category" aria-live={running ? "off" : "polite"} aria-atomic="true">{slide.label}<span>{String(frame.current + 1).padStart(2, "0")} / {slides.length}</span></div>
    <div className="hero-photo-caption"><span key={frame.sequence} className="hero-caption-enter">{slide.title}<br/>{slide.subtitle}</span><a href="#work" aria-label="Explore our programmes"><ArrowUpRight size={28}/></a></div>
    <div className="floating-note"><Icon size={27} strokeWidth={1.4}/><span key={frame.sequence} className="hero-caption-enter">{slide.note}<br/><strong>{slide.promise}</strong></span></div>
    <div className="hero-slide-controls"><div className="hero-progress" aria-hidden="true"><span key={`${frame.sequence}-${running}`} style={{ animationDuration: `${duration}ms` }}/></div><div className="hero-slide-buttons"><button onClick={() => void move(-1)} aria-label="Previous project photograph"><ChevronLeft size={16}/></button><button onClick={() => setPaused(!paused)} aria-label={paused || reducedMotion ? "Play project slideshow" : "Pause project slideshow"} aria-pressed={paused} disabled={reducedMotion} title={reducedMotion ? "Automatic playback is disabled by your reduced motion preference" : undefined}>{paused || reducedMotion ? <Play size={13}/> : <Pause size={13}/>}</button><button onClick={() => void move(1)} aria-label="Next project photograph"><ChevronRight size={16}/></button></div></div>
  </div>;
}
