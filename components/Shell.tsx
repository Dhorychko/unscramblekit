import Link from "next/link";
import { TOOLS } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import Analytics from "./Analytics";

export function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="2" y="5" width="13" height="13" rx="2.5" fill="#fff" stroke="#1f2933" strokeWidth="2" />
      <rect x="17" y="14" width="13" height="13" rx="2.5" fill="#3f8f4f" stroke="#1f2933" strokeWidth="2" />
      <text x="8.5" y="15.5" fontSize="10" fontWeight="800" textAnchor="middle" fill="#1f2933" fontFamily="Arial">U</text>
      <text x="23.5" y="24.5" fontSize="10" fontWeight="800" textAnchor="middle" fill="#fff" fontFamily="Arial">K</text>
    </svg>
  );
}

export function Header() {
  return (
    <header className="site-head">
      <div className="wrap">
        <Link prefetch={false} href="/" className="logo"><Logo />{SITE.name}</Link>
        <nav className="site-nav" aria-label="Main">
          <Link prefetch={false} href="/">Unscramble</Link>
          <Link prefetch={false} href="/wordle-solver/">Wordle</Link>
          <Link prefetch={false} href="/anagram-solver/">Anagrams</Link>
          <Link prefetch={false} href="/scrabble-word-finder/">Scrabble</Link>
          <Link prefetch={false} href="/5-letter-words/">5-letter words</Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div>
          <h2>{SITE.name}</h2>
          <p className="small">Free word game helpers. Word list based on SCOWL by Kevin Atkinson; see <Link prefetch={false} href="/about/">About</Link>. <Link prefetch={false} href="/privacy/">Privacy</Link> · <Link prefetch={false} href="/contact/">Contact</Link></p>
          <p className="small muted">Scrabble® is a trademark of Hasbro in the US and Canada and of Mattel elsewhere. Words With Friends® is a trademark of Zynga. Wordle®, Spelling Bee and Letter Boxed are trademarks of The New York Times Company. Jumble® is a trademark of Tribune Content Agency. This site isn&apos;t affiliated with any of them.</p>
        </div>
        <div>
          <h2>Solvers</h2>
          <ul>{TOOLS.map((t) => <li key={t.key}><Link prefetch={false} href={t.path}>{t.title}</Link></li>)}</ul>
        </div>
        <div>
          <h2>Word lists</h2>
          <ul>
            {[2, 3, 4, 5, 6, 7, 8].map((n) => <li key={n}><Link prefetch={false} href={`/${n}-letter-words/`}>{n}-letter words</Link></li>)}
            <li><Link prefetch={false} href="/words-with-q/">Words with Q</Link></li>
            <li><Link prefetch={false} href="/words-with-z/">Words with Z</Link></li>
          </ul>
        </div>
      </div>
      <Analytics />
    </footer>
  );
}
