import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "About UnscrambleKit and the Word List" },
  description: "How UnscrambleKit's word game solvers work, where the word list comes from (SCOWL by Kevin Atkinson), what is filtered out, and the trademark notices.",
  alternates: { canonical: "/about/" },
};

export default function About() {
  return (
    <div className="wrap article" style={{ paddingTop: 24 }}>
      <article className="prose">
        <h1>About UnscrambleKit</h1>
        <p className="lede">Fast, free helpers for word games, built on an open word list.</p>
        <h2>The word list</h2>
        <p>UnscrambleKit uses words from <a href="http://wordlist.aspell.net/" rel="nofollow noopener">SCOWL</a> (Spell Checker Oriented Word Lists) by Kevin Atkinson, size levels 10 to 70, in American and British spelling: about 110,000 words of 2 to 15 letters. SCOWL&apos;s size levels tell us how common a word is; words from levels 10–35 are shown as &ldquo;common&rdquo;.</p>
        <p>Proper nouns, abbreviations, words with apostrophes and offensive words are removed. A short list of two-letter words used in North American word games is added.</p>
        <p>This is not an official tournament dictionary. Games such as Scrabble, Words With Friends, Wordle and Spelling Bee each use their own lists, so a few words may be accepted or rejected differently there.</p>
        <h2>Privacy</h2>
        <p>The solvers run in your browser. The letters you type aren&apos;t sent anywhere.</p>
        <h2>Credits and trademarks</h2>
        <p className="small">SCOWL: Copyright 2000–2016 by Kevin Atkinson. Permission to use, copy, modify, distribute and sell these word lists, the associated scripts, the output created from the scripts, and its documentation for any purpose is hereby granted without fee, provided that the above copyright notice appears in all copies and that both that copyright notice and this permission notice appear in supporting documentation. Full notice: <a href="/scowl-copyright.txt">scowl-copyright.txt</a>.</p>
        <p className="small">Scrabble® is a trademark of Hasbro in the US and Canada and of Mattel elsewhere. Words With Friends® is a trademark of Zynga. Wordle®, Spelling Bee and Letter Boxed are trademarks of The New York Times Company. Jumble® is a trademark of Tribune Content Agency. UnscrambleKit is independent and not affiliated with or endorsed by any of them.</p>
        <p><Link prefetch={false} href="/">Back to the unscrambler</Link></p>
      </article>
    </div>
  );
}
