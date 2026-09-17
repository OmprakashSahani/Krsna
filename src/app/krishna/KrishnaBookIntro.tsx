"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./krishna.module.css";

export default function KrishnaBookIntro() {
  const [isReady, setIsReady] = useState(false);

  return (
    <div
      className={`${styles.bookIntro} ${isReady ? styles.bookIntroReady : ""}`}
      aria-hidden="true"
    >
      <div className={styles.bookIntroPanel}>
        <Image
          className={styles.bookIntroImage}
          src="/images/about/krsna-book-cover.png"
          alt=""
          width={1086}
          height={1448}
          priority
          onLoad={() => setIsReady(true)}
        />
      </div>
    </div>
  );
}
