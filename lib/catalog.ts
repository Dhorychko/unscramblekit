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
export type ListKind = "len" | "start5" | "end5" | "with5" | "letter";
export type ListItem = { key: string; path: string; title: string; h1: string; kind: ListKind; n?: number; letter?: string };
const AZ = "abcdefghijklmnopqrstuvwxyz".split("");

export const LENGTHS = [2, 3, 4, 5, 6, 7, 8, 9, 10];
export const RARE_LETTERS = ["q", "j", "x", "z"];

export function listItems(endCounts: Record<string, number>): ListItem[] {
  return [
    ...LENGTHS.map((n): ListItem => ({ key: `${n}-letter-words`, path: `/${n}-letter-words/`, title: `${n} Letter Words`, h1: `${n}-Letter Words`, kind: "len", n })),
    ...AZ.map((l): ListItem => ({ key: `5-start-${l}`, path: `/5-letter-words/starting-with-${l}/`, title: `5 Letter Words Starting With ${l.toUpperCase()}`, h1: `5-Letter Words Starting With ${l.toUpperCase()}`, kind: "start5", n: 5, letter: l })),
    ...AZ.filter((l) => (endCounts[l] ?? 0) >= 12).map((l): ListItem => ({ key: `5-end-${l}`, path: `/5-letter-words/ending-in-${l}/`, title: `5 Letter Words Ending in ${l.toUpperCase()}`, h1: `5-Letter Words Ending in ${l.toUpperCase()}`, kind: "end5", n: 5, letter: l })),
    ...AZ.map((l): ListItem => ({ key: `5-with-${l}`, path: `/5-letter-words/with-${l}/`, title: `5 Letter Words With ${l.toUpperCase()}`, h1: `5-Letter Words Containing ${l.toUpperCase()}`, kind: "with5", n: 5, letter: l })),
    ...RARE_LETTERS.map((l): ListItem => ({ key: `words-with-${l}`, path: `/words-with-${l}/`, title: `Words With ${l.toUpperCase()}`, h1: `Words With the Letter ${l.toUpperCase()}`, kind: "letter", letter: l })),
  ];
}
