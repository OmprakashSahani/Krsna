import styles from "./portfolio.module.css";

const steps = ["θₜ", "fθ(x)", "ŷ", "L(y, ŷ)", "∇θL", "θₜ₊₁"];

export function OptimizationOrbit() {
  return (
    <g className={styles.optimization}>
      <circle r="144" className={styles.orbitTrack} />
      {steps.map((step, index) => {
        const angle = index * 60 - 90;
        return (
          <g key={step} transform={`rotate(${angle})`}>
            <path d="M 137 43 A 144 144 0 0 1 116 85" className={styles.direction} />
            <path d="m 115 79 1 6 6 -1" className={styles.direction} />
            <g transform={`translate(144 0) rotate(${-angle})`}>
              <g className={styles.optimizationText}>
                <rect x="-32" y="-14" width="64" height="28" rx="14" className={styles.labelGround} />
                <text textAnchor="middle" dy="5" className={styles.formula}>{step}</text>
              </g>
            </g>
          </g>
        );
      })}
    </g>
  );
}
