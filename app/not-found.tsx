import Link from "next/link";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="wrap" style={{ paddingBlock: "40px 56px" }}>
      <h1>Can&apos;t unscramble that address</h1>
      <p className="lede">The page doesn&apos;t exist. Try one of these:</p>
      <ul className="chip-list">
        <li><Link prefetch={false} href="/">Word unscrambler</Link></li>
        <li><Link prefetch={false} href="/wordle-solver/">Wordle solver</Link></li>
        <li><Link prefetch={false} href="/5-letter-words/">5-letter words</Link></li>
        <li><Link prefetch={false} href="/anagram-solver/">Anagram solver</Link></li>
      </ul>
    </div>
  );
}
