import Image from "next/image";
import { KrishnaVerse } from "./KrishnaVerse";
import styles from "./krishna.module.css";

export function KrishnaPanel() {
  return <>
    <Image
      className={styles.image}
      src="/images/about/krsna-book-cover.png"
      alt="Kṛṣṇa book cover"
      width={1086}
      height={1448}
      sizes="(max-width: 800px) calc(100vw - 44px), (max-width: 1200px) calc(50vw - 48px), calc(44vw - 72px)"
    />
    <hr className={styles.divider} />
    <KrishnaVerse />
  </>;
}
