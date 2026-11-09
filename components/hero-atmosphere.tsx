import type { CSSProperties } from "react";

const particles = Array.from({ length: 36 }, (_, index) => ({
  left: `${(index * 43 + 7) % 100}%`,
  top: `${(index * 29 + 11) % 100}%`,
  size: `${index % 8 === 0 ? 6 : 2 + index % 3}px`,
  duration: `${12 + index % 7 * 2}s`,
  delay: `${-(index * 3.7) % 23}s`,
  drift: `${index % 2 === 0 ? 24 : -28}px`,
}));

export default function HeroAtmosphere() {
  return <div className="hero-atmosphere" aria-hidden="true">
    <div className="hero-soft-glow hero-soft-glow-primary"/>
    {particles.map((particle, index) => <span key={index} className={`hero-dust ${index % 8 === 0 ? "hero-dust-soft" : ""}`} style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size, "--dust-duration": particle.duration, "--dust-delay": particle.delay, "--dust-drift": particle.drift } as CSSProperties}/>)}
  </div>;
}
