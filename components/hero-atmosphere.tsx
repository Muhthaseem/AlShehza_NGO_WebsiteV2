import type { CSSProperties } from "react";

// Fixed positions keep the initial render identical on the server and browser.
const particles = Array.from({ length: 24 }, (_, index) => ({
  left: `${(index * 37 + 5) % 100}%`,
  size: `${index % 4 === 0 ? 13 : index % 3 === 0 ? 9 : 4}px`,
  duration: `${18 + (index * 7) % 16}s`,
  delay: `${-((index * 11) % 31)}s`,
  drift: `${(index % 2 === 0 ? 1 : -1) * (18 + index % 5 * 9)}px`,
}));

export default function HeroAtmosphere() {
  return <div className="hero-atmosphere" aria-hidden="true">
    <div className="hero-ambient-glow"/>
    {particles.map((particle, index) => <span key={index} className="hero-particle" style={{ left: particle.left, width: particle.size, height: particle.size, "--float-duration": particle.duration, "--float-delay": particle.delay, "--float-drift": particle.drift } as CSSProperties}>
      {index % 3 === 0 ? <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 0c1.3 6.3 3.7 8.7 10 10-6.3 1.3-8.7 3.7-10 10C8.7 13.7 6.3 11.3 0 10 6.3 8.7 8.7 6.3 10 0Z"/></svg> : <i/>}
    </span>)}
  </div>;
}
