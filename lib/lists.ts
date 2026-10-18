// Build-time only: word lists and stats for the static list pages.
import fs from "node:fs";
import path from "node:path";
import { SUB_LENGTHS, COMBO_LENGTHS, countKey, comboKey, listItems, type ListItem } from "./catalog";
import { isCommon } from "./solve";

const COMMON_CAP = 2500, MORE_CAP = 500;
/** Stable pseudo-random order so capped lists sample the whole alphabet instead of stopping at a letter. */
const hash = (w: string) => { let h = 2166136261; for (let i = 0; i < w.length; i++) h = Math.imul(h ^ w.charCodeAt(i), 16777619); return h >>> 0; };
let ENTRIES: [string, number][] | null = null;
export function entries(): [string, number][] {
  if (!ENTRIES) ENTRIES = Object.entries(JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "words.json"), "utf8"))) as [string, number][];
  return ENTRIES;
}

/** Lists with fewer words than this are too thin to index on their own. */
export const THIN = 30;

let LISTS: ListItem[] | null = null;
export function allLists(): ListItem[] {
  if (LISTS) return LISTS;
  const sub = new Set(SUB_LENGTHS);
  const combo = new Set(COMBO_LENGTHS);
  const counts: Record<string, number> = {};
  for (const [w] of entries()) {
    const n = w.length;
    if (sub.has(n)) {
      counts[countKey("start", n, w[0])] = (counts[countKey("start", n, w[0])] ?? 0) + 1;
      counts[countKey("end", n, w[n - 1])] = (counts[countKey("end", n, w[n - 1])] ?? 0) + 1;
      for (const l of new Set(w)) counts[countKey("with", n, l)] = (counts[countKey("with", n, l)] ?? 0) + 1;
    }
    if (combo.has(n)) {
      const k = comboKey(n, w[0], w[n - 1]);
      counts[k] = (counts[k] ?? 0) + 1;
    }
  }
  return (LISTS = listItems(counts));
}

export type ListData = { common: string[]; more: string[]; total: number; commonTotal: number; moreTotal: number; posFreq: [string, number][][]; firstLetters: [string, number][]; starters: string[] };

export function listData(it: ListItem): ListData {
  const l = it.letter ?? "";
  const match = (w: string) => {
    switch (it.kind) {
      case "len": return w.length === it.n;
      case "start": return w.length === it.n && w[0] === l;
      case "end": return w.length === it.n && w[w.length - 1] === l;
      case "with": return w.length === it.n && w.includes(l);
      case "startend": return w.length === it.n && w[0] === l && w[w.length - 1] === (it.letter2 ?? "");
      case "letter": return w.includes(l) && w.length <= 10;
    }
  };
  const hits = entries().filter(([w]) => match(w));
  // Long lists are capped so pages stay light: keep the most common words (lowest SCOWL level); within a level, sample
  // evenly across the alphabet; then sort for display.
  const pick = (arr: [string, number][], cap: number) => arr.length <= cap ? arr.map(([w]) => w) : [...arr].sort((a, b) => a[1] - b[1] || hash(a[0]) - hash(b[0])).slice(0, cap).map(([w]) => w);
  const commonAll = hits.filter(([, t]) => isCommon(t)), moreAll = hits.filter(([, t]) => !isCommon(t));
  const allCommon = commonAll.map(([w]) => w).sort();
  const common = pick(commonAll, COMMON_CAP).sort((a, b) => (it.kind === "letter" ? a.length - b.length : 0) || a.localeCompare(b));
  const more = pick(moreAll, MORE_CAP).sort((a, b) => (it.kind === "letter" ? a.length - b.length : 0) || a.localeCompare(b));
  // Letter frequency by position (common words), for the Wordle tips
  const len = it.n ?? 0;
  const posFreq: [string, number][][] = [];
  if (len && len <= 7) for (let i = 0; i < len; i++) {
    const f: Record<string, number> = {};
    for (const w of allCommon) f[w[i]] = (f[w[i]] ?? 0) + 1;
    posFreq.push(Object.entries(f).sort((a, b) => b[1] - a[1]).slice(0, 3));
  }
  const fl: Record<string, number> = {};
  for (const w of allCommon) fl[w[0]] = (fl[w[0]] ?? 0) + 1;
  const firstLetters = Object.entries(fl).sort((a, b) => b[1] - a[1]).slice(0, 5);
  // Good first guesses: common words with 5 different, frequent letters
  const lf: Record<string, number> = {};
  for (const w of allCommon) for (const ch of new Set(w)) lf[ch] = (lf[ch] ?? 0) + 1;
  const starters = allCommon.filter((w) => new Set(w).size === w.length && !(w.endsWith("s") && !w.endsWith("ss"))).map((w) => ({ w, s: [...w].reduce((a, ch) => a + (lf[ch] ?? 0), 0) })).sort((a, b) => b.s - a.s).slice(0, 6).map((x) => x.w);
  return { common, more, total: hits.length, commonTotal: commonAll.length, moreTotal: moreAll.length, posFreq, firstLetters, starters };
}
