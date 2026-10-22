export type ToolKind = "unscramble" | "anagram" | "scrabble" | "wwf" | "jumble" | "wordle" | "bee" | "box";
export type ToolItem = { key: string; path: string; title: string; h1: string; short: string; kind: ToolKind };

export const TOOLS: ToolItem[] = [
  { key: "home", path: "/", title: "Word Unscrambler", h1: "Unscramble Words", short: "every word you can make from your letters", kind: "unscramble" },
  { key: "anagram-solver", path: "/anagram-solver/", title: "Anagram Solver", h1: "Anagram Solver", short: "words that use all the letters", kind: "anagram" },
  { key: "wordle-solver", path: "/wordle-solver/", title: "Wordle Solver", h1: "Wordle Solver and Helper", short: "enter your colors, get possible answers", kind: "wordle" },
  { key: "scrabble-word-finder", path: "/scrabble-word-finder/", title: "Scrabble Word Finder", h1: "Scrabble Word Finder", short: "highest-scoring words from your rack", kind: "scrabble" },
  { key: "words-with-friends-helper", path: "/words-with-friends-helper/", title: "Words With Friends Helper", h1: "Words With Friends Helper", short: "words and points for your tiles", kind: "wwf" },
  { key: "jumble-solver", path: "/jumble-solver/", title: "Jumble Solver", h1: "Jumble Solver", short: "solve several scrambled words at once", kind: "jumble" },
  { key: "spelling-bee-solver", path: "/spelling-bee-solver/", title: "Spelling Bee Solver", h1: "Spelling Bee Solver", short: "all words and pangrams from 7 letters", kind: "bee" },
  { key: "letter-boxed-solver", path: "/letter-boxed-solver/", title: "Letter Boxed Solver", h1: "Letter Boxed Solver", short: "valid words and two-word solutions", kind: "box" },
];
export const TOOL_BY_KEY = Object.fromEntries(TOOLS.map((t) => [t.key, t])) as Record<string, ToolItem>;

// ---------- Word list pages ----------
export type ListKind = "len" | "start" | "end" | "with" | "startend" | "letter";
export type ListItem = { key: string; path: string; title: string; h1: string; kind: ListKind; n?: number; letter?: string; letter2?: string };
const AZ = "abcdefghijklmnopqrstuvwxyz".split("");

export const LENGTHS = [2, 3, 4, 5, 6, 7, 8, 9, 10];
/** Word lengths that get starting-with / ending-in / containing subpages (real search demand, enough words). */
export const SUB_LENGTHS = [3, 4, 5, 6, 7];
/** Word length(s) that get start+end combo pages ("5 letter words starting with S and ending in E") — the Wordle long tail. */
export const COMBO_LENGTHS = [5];
/** Only build a subpage when it has at least this many words, so every generated subpage is indexable (not thin). */
export const GEN_FLOOR = 30;
/** 5-letter "starting with" / "ending in" pages are real Wordle searches even when the list is short
 *  ("5 letter words starting with x" has only 7 answers), so they get a much lower floor. */
export const SHORT_FLOOR = 5;
export const floorFor = (kind: string, n?: number) => (n === 5 && (kind === "start" || kind === "end") ? SHORT_FLOOR : GEN_FLOOR);
export const RARE_LETTERS = ["q", "j", "x", "z"];

const SUB_KINDS = ["start", "end", "with"] as const;
const countKey = (kind: string, n: number, l: string) => `${kind}:${n}:${l}`;
const comboKey = (n: number, l1: string, l2: string) => `se:${n}:${l1}:${l2}`;

/** `counts` holds, per (kind,length,letter), how many words match — supplied by lib/lists.ts at build time. */
export function listItems(counts: Record<string, number>): ListItem[] {
  const items: ListItem[] = LENGTHS.map((n) => ({ key: `${n}-letter-words`, path: `/${n}-letter-words/`, title: `${n} Letter Words`, h1: `${n}-Letter Words`, kind: "len", n }));
  for (const n of SUB_LENGTHS) {
    for (const kind of SUB_KINDS) {
      for (const l of AZ) {
        if ((counts[countKey(kind, n, l)] ?? 0) < floorFor(kind, n)) continue;
        const L = l.toUpperCase();
        const seg = kind === "start" ? `starting-with-${l}` : kind === "end" ? `ending-in-${l}` : `with-${l}`;
        const titleWhat = kind === "start" ? `Starting With ${L}` : kind === "end" ? `Ending in ${L}` : `With ${L}`;
        const h1What = kind === "start" ? `Starting With ${L}` : kind === "end" ? `Ending in ${L}` : `Containing ${L}`;
        items.push({ key: `${n}-${kind}-${l}`, path: `/${n}-letter-words/${seg}/`, title: `${n} Letter Words ${titleWhat}`, h1: `${n}-Letter Words ${h1What}`, kind, n, letter: l });
      }
    }
  }
  for (const n of COMBO_LENGTHS) {
    for (const l1 of AZ) {
      for (const l2 of AZ) {
        if ((counts[comboKey(n, l1, l2)] ?? 0) < GEN_FLOOR) continue;
        const L1 = l1.toUpperCase(), L2 = l2.toUpperCase();
        items.push({ key: `${n}-se-${l1}-${l2}`, path: `/${n}-letter-words/starting-with-${l1}-ending-in-${l2}/`, title: `${n} Letter Words Starting With ${L1} and Ending in ${L2}`, h1: `${n}-Letter Words Starting With ${L1} and Ending in ${L2}`, kind: "startend", n, letter: l1, letter2: l2 });
      }
    }
  }
  for (const l of AZ) items.push({ key: `words-with-${l}`, path: `/words-with-${l}/`, title: `Words With ${l.toUpperCase()}`, h1: `Words With the Letter ${l.toUpperCase()}`, kind: "letter", letter: l });
  return items;
}

export { countKey, comboKey };
