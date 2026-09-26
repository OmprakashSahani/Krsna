import styles from "./panels.module.css";

const interests = [
  ["ML Systems", "Training, inference, benchmarking, observability, and performance.", "train → measure → improve"],
  ["Robot Learning", "Robot datasets, forward kinematics, trajectories, and workspace coverage.", "data → motion → workspace"],
  ["AI Evaluation", "Retrieval quality, evaluation, benchmarking, and regression analysis.", "query → evidence → evaluation"],
  ["Distributed Systems", "Communication, synchronization, scaling, and performance analysis.", "communicate → synchronize → scale"],
];

export function ResearchPanel() {
  return <><p className={styles.intro}>Things I want to understand more deeply.</p><ol className={styles.research} role="list">{interests.map(([title, description, trace], index) => <li key={title}>
    <span className={styles.researchIndex}>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p><p className={styles.annotation}>{trace}</p></div>
  </li>)}</ol></>;
}
