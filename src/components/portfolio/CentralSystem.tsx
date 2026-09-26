import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { OptimizationOrbit } from "./OptimizationOrbit";
import { FourROrbit, reviews } from "./FourROrbit";
import styles from "./portfolio.module.css";

export function CentralSystem({ paused, onToggleMotion }: { paused: boolean; onToggleMotion: () => void }) {
  const wordmark = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const heading = wordmark.current;
    if (!heading) return;
    const dots = Array.from(heading.querySelectorAll<HTMLElement>(`.${styles.diacriticDot}`));
    let disposed = false;
    const snapDots = () => {
      if (disposed) return;
      dots.forEach(dot => dot.style.removeProperty("--dot-snap-x"));
      const pixelRatio = window.devicePixelRatio || 1;
      const offsets = dots.map(dot => {
        const { x, width } = dot.getBoundingClientRect();
        const scale = width / dot.offsetWidth;
        // Account for the hub's existing scale without changing dot dimensions.
        return scale > 0 ? (Math.round(x * pixelRatio) / pixelRatio - x) / scale : 0;
      });
      dots.forEach((dot, index) => dot.style.setProperty("--dot-snap-x", `${offsets[index]}px`));
    };
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target instanceof Element && event.target.contains(heading)) snapDots();
    };
    snapDots();
    document.fonts?.ready.then(snapDots);
    window.addEventListener("resize", snapDots);
    document.addEventListener("transitionend", onTransitionEnd);
    return () => {
      disposed = true;
      window.removeEventListener("resize", snapDots);
      document.removeEventListener("transitionend", onTransitionEnd);
    };
  });

  return (
    <div className={styles.instrument} data-paused={paused}>
      <div className={styles.system}>
        <svg viewBox="0 0 640 640" className={styles.diagram} role="img" aria-labelledby="system-description">
          <title id="system-description">An iterative learning system: parameters, prediction, loss, gradient, and updated parameters. The personal 4R review: repeat what worked well; refine what was average; rectify what went wrong; reject what no longer serves.</title>
          <g transform="translate(320 320)" aria-hidden="true">
            <g className={styles.construction}>
              <path d="M -190 0 H -85 M 85 0 H 191 M 0 -191 V -84 M 0 84 V 191" />
              <path d="M -205 -157 L -205 132 L -163 165 M 170 -181 L 199 -153 L 199 126" strokeDasharray="2 6" />
              <ellipse rx="186" ry="177" transform="rotate(-28)" strokeDasharray="1 9" />
              <path d="M -64 -76 H -77 V -64 M 64 -76 H 77 V -64 M -77 64 V 76 H -64 M 77 64 V 76 H 64" />
              <path d="M -268 -53 h 10 m -5 -5 v 10 M 259 89 h 10 m -5 -5 v 10" />
              <path d="m -184 145 15 -23 13 5 17 -20" />
              <circle cx="-184" cy="145" r="3" /><circle cx="-169" cy="122" r="3" /><circle cx="-156" cy="127" r="3" /><circle cx="-139" cy="107" r="3" />
              <rect x="181" y="-130" width="6" height="6" />
            </g>
            <OptimizationOrbit />
            <FourROrbit />
            <g className={styles.fixedNotes}>
              <text className={styles.mathLabel} x="0" y="-94" textAnchor="middle">θ − η∇L</text>
              <text className={styles.mathLabel} x="-3" y="101" textAnchor="end">∇L</text>
              <text className={styles.mathLabel} x="1" y="101" textAnchor="start">(θ)</text>
              <text x="0" y="-50" textAnchor="middle">LEARN / UPDATE</text>
              <text x="0" y="54" textAnchor="middle"><tspan className={styles.iterateSymbol}>↺</tspan><tspan dx="2">ITERATE</tspan></text>
            </g>
          </g>
        </svg>
        <h1 ref={wordmark} className={styles.center}>
          <Link href="/krishna" aria-label="Kṛṣṇa — open the Krishna page">
            K<span className={styles.diacriticLetter}>r<span className={styles.diacriticDot} aria-hidden="true" /></span><span className={styles.diacriticLetter}>s<span className={styles.diacriticDot} aria-hidden="true" /></span><span className={styles.diacriticLetter}>n<span className={styles.diacriticDot} aria-hidden="true" /></span>a<span className={styles.wordmarkRule} aria-hidden="true" />
          </Link>
        </h1>
      </div>
      <div className={styles.systemCaption}>
        <p><span className={styles.captionMark} aria-hidden="true">□</span> 4R SYSTEM <span>{"// personal review heuristic"}</span></p>
        <p>review → learn → adjust → continue</p>
        <button type="button" className={styles.motionControl} aria-pressed={paused} onClick={onToggleMotion}>{paused ? "Resume motion" : "Pause motion"}<span aria-hidden="true"> {paused ? "+" : "Ⅱ"}</span></button>
      </div>
      <dl className={styles.mobileReview}>{reviews.map(([name, meaning]) => <div key={name}><dt>{name}</dt><dd>{meaning}</dd></div>)}</dl>
    </div>
  );
}
