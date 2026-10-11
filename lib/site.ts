export const SITE = {
  name: "UnscrambleKit",
  domain: "unscramblekit.com",
  updated: "October 2026",
  url: (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://unscramblekit.com").replace(/\/$/, ""),
  description: "Unscramble words, solve anagrams and get help with Wordle, Scrabble, Words With Friends, Jumble, Spelling Bee and Letter Boxed. Free word lists too.",
};

/** Shared Open Graph fields; page metadata replaces the whole openGraph object, so pages spread this in. */
export const OG_BASE = { siteName: SITE.name, type: "website" as const, locale: "en_US", images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.name }] };
