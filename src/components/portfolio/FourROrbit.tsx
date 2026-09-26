import styles from "./portfolio.module.css";

export const reviews = [
  ["REPEAT", "what worked well"],
  ["REFINE", "what was average"],
  ["RECTIFY", "what went wrong"],
  ["REJECT", "what no longer serves"],
];

export function FourROrbit() {
  return (
    <g className={styles.reviewOrbit}>
      {/* Broken arcs and offset observations describe a review path, not a badge. */}
      {reviews.map(([title, description], index) => {
        const angle = -index * 90 - 60;
        return (
          <g key={title} transform={`rotate(${angle})`}>
            <path d="M 225 -109 A 250 250 0 0 0 130 -213" className={styles.reviewTrack} />
            <path d="m 137 -212 -7 -1 2 7" className={styles.direction} />
            <g transform={`translate(250 0) rotate(${-angle})`}>
              <g className={styles.reviewText}>
                <rect x="-79" y="-19" width="158" height="49" className={styles.labelGround} />
                <text textAnchor="middle" className={styles.reviewName}>{title}</text>
                <text textAnchor="middle" y="19" className={styles.reviewDescription}>{description}</text>
                <circle cy="-26" r="2.5" className={styles.observation} />
              </g>
            </g>
          </g>
        );
      })}
    </g>
  );
}
