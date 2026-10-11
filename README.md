# UnscrambleKit

Word game helpers (unscrambler, anagrams, Wordle, Scrabble, Words With Friends, Jumble, Spelling Bee, Letter Boxed) and static word-list pages. Next.js 16 static export.

- Word list: SCOWL levels 10–70 (Kevin Atkinson; permissive license, see `scripts/SCOWL-Copyright.txt`), filtered by `scripts/blocklist.txt`. Rebuild with `python3 scripts/build-dict.py` → `data/words.json` (build-time pages) and `public/words.txt` (loaded by the solvers in the browser).
- `npm run build` → `out/`; `npm test` → solver tests.
- Vercel: preset Next.js (`vercel.json`), add `unscramblekit.com`, redirect `www` → apex (308). Optional env: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GSC_VERIFICATION`.

## Before launch
- Contact page shows hello@unscramblekit.com: set up forwarding for this address at your domain registrar (or change it in app/contact/page.tsx).
- Privacy page (/privacy/) already covers advertising cookies; add your ads.txt to public/ once AdSense approves the site.
- The dictionary file name includes a content hash (public/words.<hash>.txt); vercel.json caches it for a year. Rebuild it with `python3 scripts/build-dict.py`.
