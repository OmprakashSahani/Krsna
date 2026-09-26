"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./AboutFavoritesCarousel.module.css";

const slides = [
  {
    label: "Favorite book",
    title: "Kṛṣṇa: The Supreme Personality of Godhead",
    image: "/images/about/krsna-book-cover.png",
    href: "https://vedabase.io/en/library/kb/",
  },
  {
    label: "Favorite book",
    title: "Śrīmad-Bhāgavatam",
    image: "/images/about/srimad-bhagavatam-book-cover.png",
    href: "https://vedabase.io/en/library/sb/",
  },
  {
    label: "Favorite book",
    title: "Bhagavad Gītā",
    image: "/images/about/bhagavad-gita-book-cover.png",
    href: "https://vedabase.io/en/library/bg/",
  },
  {
    label: "Favorite destination",
    title: "Vrindavan",
    image: "/images/about/vrindavan-destination.png",
  },
  {
    label: "Favorite place",
    title: "Rajasthan",
    image: "/images/about/rajasthan-place.png",
  },
  {
    label: "Favorite movie",
    title: "Little Krishna",
    image: "/images/about/little-krishna-poster.png",
  },
  {
    label: "Favorite movie",
    title: "Mahavatar Narsimha",
    image: "/images/about/mahavatar-narsimha-poster.png",
  },
  {
    label: "Favorite movie",
    title: "Spider-Man",
    image: "/images/about/spider-man-poster.png",
  },
  {
    label: "Favorite movie",
    title: "Superman",
    image: "/images/about/superman-poster.png",
  },
];

export function AboutFavoritesCarousel({ active = true }: { active?: boolean }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!active || hovered || focused) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      if (!media.matches) timer = setTimeout(() => setIndex(current => (current + 1) % slides.length), 4000);
    };
    schedule();
    media.addEventListener("change", schedule);
    return () => {
      clearTimeout(timer);
      media.removeEventListener("change", schedule);
    };
  }, [active, hovered, focused, index]);

  const slide = slides[index];

  const content = (
    <>
      <div className={styles.imageFrame}>
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          sizes="(max-width: 720px) 80vw, 520px"
          className={styles.image}
        />
      </div>

      <div className={styles.caption}>
        <span>{slide.label}</span>
        <strong>{slide.title}</strong>
      </div>
    </>
  );

  return (
    <figure className={styles.carousel} aria-label="A few favorites"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className={styles.window}>
        {slide.href ? (
          <a
            href={slide.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.slide}
          >
            {content}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <div className={styles.slide}>{content}</div>
        )}
      </div>

      <div className={styles.status}>
        <button type="button" onClick={() => setIndex((index - 1 + slides.length) % slides.length)} aria-label="Previous favorite">←</button>
        <span role="status" aria-live="polite">{String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")} · {slide.title}</span>
        <button type="button" onClick={() => setIndex((index + 1) % slides.length)} aria-label="Next favorite">→</button>
      </div>
    </figure>
  );
}
