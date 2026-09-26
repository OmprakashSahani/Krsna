import { sections, type SectionId } from "./sections";
import styles from "./portfolio.module.css";

export function HubNavigation({ active, onSelect }: { active: SectionId | null; onSelect: (id: SectionId) => void }) {
  return <nav className={styles.navigation} aria-label="Explore Omprakash’s portfolio">
    {sections.map(section => <button key={section.id} id={`hub-${section.id}`} type="button" aria-label={`${section.index} ${section.label}`} data-section={section.id} className={styles.navLabel} aria-expanded={active === section.id} aria-controls={`portfolio-panel-${section.side}`} onClick={() => onSelect(section.id)}><span className={styles.navIndex}>{section.index}</span><span>{section.label}</span><span className={styles.navMarker} aria-hidden="true" /></button>)}
  </nav>;
}
