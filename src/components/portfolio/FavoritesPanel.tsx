import { AboutFavoritesCarousel } from "@/components/AboutFavoritesCarousel";
import styles from "./panels.module.css";

export function FavoritesPanel({ active }: { active: boolean }) {
  return <><p className={styles.intro}>Books, places, and movies.</p><AboutFavoritesCarousel key={active ? "open" : "closed"} active={active} /></>;
}
