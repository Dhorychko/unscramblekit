// Word-game solvers. Pure functions over a word list, used both in the browser and at build time.

export type Dict = { words: string[]; tier: Map<string, number> };
/** Tier: SCOWL level where the word first appears. ≤35 common, 40–50 less common, ≥55 rare. */
export const isCommon = (t: number) => t <= 35;

export function parseDict(text: string): Dict {
  const words: string[] = [];
  const tier = new Map<string, number>();
  let cur = 70;
  for (const ln of text.split("\n")) {
    if (!ln) continue;
    if (ln[0] === "#") { cur = Number(ln.slice(1)) || 70; continue; }
    words.push(ln);
    tier.set(ln, cur);
  }
  return { words, tier };
}

const A = 97;
export function counts(s: string): Int8Array {
  const c = new Int8Array(26);
  for (let i = 0; i < s.length; i++) { const k = s.charCodeAt(i) - A; if (k >= 0 && k < 26) c[k]++; }
  return c;
}

export const clean = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
/** Letters plus blank tiles: only ? and * count as blanks (spaces and punctuation are ignored). */
export function parseRack(s: string): { letters: string; blanks: number } {
  const lower = s.toLowerCase();
  const blanks = Math.min(3, (lower.match(/[?*]/g) ?? []).length);
  return { letters: clean(lower).slice(0, 15), blanks };
}

/** Bonus for playing all seven tiles from the rack in one turn. */
export const BINGO = { scrabble: 50, wwf: 35 } as const;

/** Can `word` be built from the rack (letter counts + blanks)? Returns the letters supplied by blanks, or null. */
export function buildFrom(word: string, rack: Int8Array, blanks: number): string | null {
  const need = new Int8Array(rack);
  let used = "";
  for (let i = 0; i < word.length; i++) {
    const k = word.charCodeAt(i) - A;
    if (need[k] > 0) need[k]--;
    else if (blanks > used.length) used += word[i];
    else return null;
  }
  return used;
}

export const SCRABBLE: Record<string, number> = { a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1, j: 8, k: 5, l: 1, m: 3, n: 1, o: 1, p: 3, q: 10, r: 1, s: 1, t: 1, u: 1, v: 4, w: 4, x: 8, y: 4, z: 10 };
export const WWF: Record<string, number> = { a: 1, b: 4, c: 4, d: 2, e: 1, f: 4, g: 3, h: 3, i: 1, j: 10, k: 5, l: 2, m: 4, n: 2, o: 1, p: 4, q: 10, r: 1, s: 1, t: 1, u: 2, v: 5, w: 4, x: 8, y: 3, z: 10 };

/** Face value of a word; letters that came from blank tiles score 0. */
export function score(word: string, values: Record<string, number>, fromBlanks = ""): number {
  let s = 0;
  const b = fromBlanks.split("");
  for (const ch of word) {
    const j = b.indexOf(ch);
    if (j >= 0) { b.splice(j, 1); continue; }
    s += values[ch] ?? 0;
  }
  return s;
}

export type Hit = { word: string; tier: number; blanks: string; score?: number; bingo?: boolean };
export type Filter = { minLen?: number; maxLen?: number; starts?: string; ends?: string; contains?: string; pattern?: string };

function passes(w: string, f: Filter): boolean {
  if (f.minLen && w.length < f.minLen) return false;
  if (f.maxLen && w.length > f.maxLen) return false;
  if (f.starts && !w.startsWith(f.starts)) return false;
  if (f.ends && !w.endsWith(f.ends)) return false;
  if (f.contains && !w.includes(f.contains)) return false;
  if (f.pattern) {
    // pattern like "c?t" or "_a__e": letters fixed, ? or _ any letter
    const p = f.pattern.toLowerCase().replace(/[^a-z?_.]/g, "");
    if (p && (p.length !== w.length || ![...p].every((ch, i) => ch === "?" || ch === "_" || ch === "." || ch === w[i]))) return false;
  }
  return true;
}

/** All words that can be made from the letters (and blanks), longest first. */
export function unscramble(d: Dict, input: string, f: Filter = {}, values?: Record<string, number>): Hit[] {
  const { letters, blanks } = parseRack(input);
  if (!letters.length && !blanks) return [];
  // Letters required by filters must come from the rack too, so they don't need special handling beyond the rack check.
  const rack = counts(letters);
  const max = letters.length + blanks;
  const out: Hit[] = [];
  for (const w of d.words) {
    if (w.length > max || w.length < 2) continue;
    if (!passes(w, f)) continue;
    const b = buildFrom(w, rack, blanks);
    if (b === null) continue;
    const t = d.tier.get(w) ?? 70;
    out.push({ word: w, tier: t, blanks: b, score: values ? score(w, values, b) : undefined });
  }
  return out.sort((a, b) => b.word.length - a.word.length || (values ? (b.score ?? 0) - (a.score ?? 0) : 0) || a.tier - b.tier || a.word.localeCompare(b.word));
}

/** Words that use exactly all the letters (other than the word typed in). */
export function anagrams(d: Dict, input: string): Hit[] {
  const { letters, blanks } = parseRack(input);
  const n = letters.length + blanks;
  return unscramble(d, input, { minLen: n, maxLen: n }).filter((h) => h.word.length === n && h.word !== letters);
}

// ---------------------------------------------------------------- Wordle
export type Mark = "g" | "y" | "x";
export type Guess = { word: string; marks: Mark[] };

/** Filter 5-letter words by Wordle feedback. Handles repeated letters the way Wordle colors them. */
export function wordleCandidates(d: Dict, guesses: Guess[], len = 5): Hit[] {
  const pool = d.words.filter((w) => w.length === len);
  const ok = (w: string) => guesses.every((g) => {
    const word = g.word.toLowerCase();
    if (word.length !== len) return true;
    const minCount: Record<string, number> = {}, maxCount: Record<string, number> = {};
    for (let i = 0; i < len; i++) {
      const ch = word[i], m = g.marks[i];
      if (m === "g") { if (w[i] !== ch) return false; }
      else if (m === "y") { if (w[i] === ch) return false; }
      else if (w[i] === ch) return false;
      if (m !== "x") minCount[ch] = (minCount[ch] ?? 0) + 1;
    }
    for (let i = 0; i < len; i++) if (g.marks[i] === "x") maxCount[word[i]] = minCount[word[i]] ?? 0;
    for (const [ch, n] of Object.entries(minCount)) if (w.split(ch).length - 1 < n) return false;
    for (const [ch, n] of Object.entries(maxCount)) if (w.split(ch).length - 1 > n) return false;
    return true;
  });
  return pool.filter(ok).map((w) => ({ word: w, tier: d.tier.get(w) ?? 70, blanks: "" })).sort((a, b) => a.tier - b.tier || a.word.localeCompare(b.word));
}

/** Rank candidates by how many of the remaining possibilities' common letters they test. */
export function bestGuesses(cands: Hit[], n = 5): string[] {
  const freq: Record<string, number> = {};
  for (const c of cands) for (const ch of new Set(c.word)) freq[ch] = (freq[ch] ?? 0) + 1;
  return [...cands]
    .map((c) => ({ w: c.word, s: [...new Set(c.word)].reduce((a, ch) => a + (freq[ch] ?? 0), 0) - (isCommon(c.tier) ? 0 : cands.length * 0.15) }))
    .sort((a, b) => b.s - a.s).slice(0, n).map((x) => x.w);
}

// ---------------------------------------------------------------- Spelling Bee
const MASKS = new WeakMap<Dict, Int32Array>();
/** 26-bit letter-set mask per word, computed once per dictionary. */
function masksOf(d: Dict): Int32Array {
  let m = MASKS.get(d);
  if (!m) {
    m = new Int32Array(d.words.length);
    for (let i = 0; i < d.words.length; i++) { const w = d.words[i]; let x = 0; for (let j = 0; j < w.length; j++) x |= 1 << (w.charCodeAt(j) - A); m[i] = x; }
    MASKS.set(d, m);
  }
  return m;
}

export function spellingBee(d: Dict, letters: string, center: string): (Hit & { pangram: boolean })[] {
  const c = clean(center)[0];
  if (!c) return [];
  let allowed = 1 << (c.charCodeAt(0) - A);
  const cBit = allowed;
  for (const ch of clean(letters)) allowed |= 1 << (ch.charCodeAt(0) - A);
  const m = masksOf(d);
  const out: (Hit & { pangram: boolean })[] = [];
  for (let i = 0; i < d.words.length; i++) {
    const w = d.words[i];
    if (w.length < 4 || (m[i] & cBit) === 0 || (m[i] & ~allowed) !== 0) continue;
    out.push({ word: w, tier: d.tier.get(w) ?? 70, blanks: "", pangram: m[i] === allowed });
  }
  return out.sort((a, b) => Number(b.pangram) - Number(a.pangram) || b.word.length - a.word.length || a.tier - b.tier || a.word.localeCompare(b.word));
}

// ---------------------------------------------------------------- Letter Boxed
export function letterBoxedWords(d: Dict, sides: string[]): Hit[] {
  const side = new Map<string, number>();
  sides.forEach((s, i) => clean(s).split("").forEach((ch) => side.set(ch, i)));
  if (side.size < 3) return [];
  return d.words.filter((w) => {
    if (w.length < 3) return false;
    for (let i = 0; i < w.length; i++) {
      const s = side.get(w[i]);
      if (s === undefined) return false;
      if (i > 0 && side.get(w[i - 1]) === s) return false;
    }
    return true;
  }).map((w) => ({ word: w, tier: d.tier.get(w) ?? 70, blanks: "" }))
    .sort((a, b) => new Set(b.word).size - new Set(a.word).size || a.tier - b.tier);
}

/** Two-word solutions that use every letter; the second word starts with the last letter of the first. */
export function letterBoxedPairs(words: Hit[], sides: string[], limit = 30): [string, string][] {
  const letters = Array.from(new Set(clean(sides.join(""))));
  const bit = new Map(letters.map((ch, i) => [ch, 1 << i]));
  const full = (1 << letters.length) - 1;
  const mask = (w: string) => { let m = 0; for (const ch of w) m |= bit.get(ch) ?? 0; return m; };
  const items = words.map((h) => ({ h, m: mask(h.word) }));
  const byFirst = new Map<string, typeof items>();
  for (const it of items) { const k = it.h.word[0]; if (!byFirst.has(k)) byFirst.set(k, []); byFirst.get(k)!.push(it); }
  const out: { p: [string, string]; s: number }[] = [];
  for (const a of items) {
    for (const b of byFirst.get(a.h.word[a.h.word.length - 1]) ?? []) {
      if ((a.m | b.m) === full) out.push({ p: [a.h.word, b.h.word], s: a.h.tier + b.h.tier + (a.h.word.length + b.h.word.length) * 2 });
    }
  }
  return out.sort((x, y) => x.s - y.s).slice(0, limit).map((x) => x.p);
}

// ---------------------------------------------------------------- Lists for static pages
export function listWords(entries: [string, number][], f: Filter): { common: string[]; more: string[] } {
  const hits = entries.filter(([w]) => passes(w, f));
  const common = hits.filter(([, t]) => isCommon(t)).map(([w]) => w).sort();
  const more = hits.filter(([, t]) => !isCommon(t)).map(([w]) => w).sort();
  return { common, more };
}
