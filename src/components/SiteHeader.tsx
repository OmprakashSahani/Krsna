import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-logo" href="/krishna" aria-label="Kṛṣṇa verse">
        <span className="logo-wordmark">Kṛṣṇa</span>
        <span className="logo-line" aria-hidden="true" />
      </Link>
      <nav aria-label="Primary navigation">
        <a href="https://github.com/OmprakashSahani" target="_blank" rel="noopener noreferrer">GitHub<span className="sr-only"> (opens in a new tab)</span></a>
        <a href="https://www.linkedin.com/in/omprakashsahani/" target="_blank" rel="noopener noreferrer">LinkedIn<span className="sr-only"> (opens in a new tab)</span></a>
        <Link href="/resume">Resume</Link>
        <a href="mailto:Omprakash.Sahani1206@gmail.com">Email</a>
      </nav>
    </header>
  );
}
