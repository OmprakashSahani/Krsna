import styles from "./krishna.module.css";

export function KrishnaVerse() {
  return (
    <article className={styles.verseComposition}>
      <h3 className={styles.verseReference}>ŚB 10.21.5</h3>

      <p className={styles.devanagari} lang="sa">
        बर्हापीडं नटवरवपु: कर्णयो: कर्णिकारं<br />
        बिभ्रद् वास: कनककपिशं वैजयन्तीं च मालाम् ।<br />
        रन्ध्रान् वेणोरधरसुधया पूरयन्गोपवृन्दै-<br />
        र्वृन्दारण्यं स्वपदरमणं प्राविशद् गीतकीर्ति: ॥ ५ ॥
      </p>

      <p className={styles.transliteration} lang="sa-Latn">
        barhāpīḍaṁ naṭa-vara-vapuḥ karṇayoḥ karṇikāraṁ<br />
        bibhrad vāsaḥ kanaka-kapiśaṁ vaijayantīṁ ca mālām<br />
        randhrān veṇor adhara-sudhayāpūrayan gopa-vṛndair<br />
        vṛndāraṇyaṁ sva-pada-ramaṇaṁ prāviśad gīta-kīrtiḥ
      </p>

      <section className={styles.translation} aria-labelledby="translation-heading">
        <h4 id="translation-heading">Translation</h4>
        <p lang="en">Wearing a peacock-feather ornament upon His head, blue karṇikāra flowers on His ears, a yellow garment as brilliant as gold, and the Vaijayantī garland, Lord Kṛṣṇa exhibited His transcendental form as the greatest of dancers as He entered the forest of Vṛndāvana, beautifying it with the marks of His footprints. He filled the holes of His flute with the nectar of His lips, and the cowherd boys sang His glories.</p>
      </section>
    </article>
  );
}
