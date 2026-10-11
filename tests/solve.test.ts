import { DICT_FILE } from "../lib/dictFile.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parseDict, unscramble, anagrams, wordleCandidates, spellingBee, letterBoxedWords, letterBoxedPairs, score, SCRABBLE, buildFrom, counts, listWords } from "../lib/solve.ts";

const d = parseDict(fs.readFileSync(new URL(`../public${DICT_FILE}`, import.meta.url), "utf8"));

test("dictionary loads and is filtered", () => {
  assert.ok(d.words.length > 100000);
  for (const bad of ["fuck", "shit", "cunt"]) assert.ok(!d.tier.has(bad));
  for (const ok of ["spice", "classic", "peacock", "qi", "za"]) assert.ok(d.tier.has(ok), ok);
});

test("unscramble and anagrams", () => {
  const r = unscramble(d, "tacs").map((h) => h.word);
  for (const w of ["cats", "cast", "acts", "scat", "cat", "act", "sat", "at"]) assert.ok(r.includes(w), w);
  assert.ok(r.every((w) => w.length <= 4));
  const an = anagrams(d, "listen").map((h) => h.word);
  for (const w of ["silent", "enlist", "tinsel", "inlets"]) assert.ok(an.includes(w), w);
  const blanks = unscramble(d, "qz?").map((h) => h.word);
  assert.ok(blanks.every((w) => w.length <= 3));
  assert.equal(buildFrom("aab", counts("ab"), 0), null);
  assert.equal(buildFrom("aab", counts("ab"), 1), "a");
});

test("scrabble scoring with blanks", () => {
  assert.equal(score("quiz", SCRABBLE), 22);
  assert.equal(score("quiz", SCRABBLE, "q"), 12);
});

test("wordle filter handles greens, yellows, grays and repeats", () => {
  const c = wordleCandidates(d, [{ word: "crane", marks: ["x", "y", "x", "x", "y"] }, { word: "tower", marks: ["x", "x", "x", "g", "g"] }]).map((h) => h.word);
  assert.ok(c.length > 0);
  for (const w of c) { assert.ok(w.endsWith("er")); assert.ok(!/[cant ow]/.test(w.replace(/er$/, "").replace(/r/g, ""))); assert.ok(w.includes("r")); assert.notEqual(w[1], "r"); }
  // repeated letter: "geese" with first e green and others gray => exactly one e
  const g = wordleCandidates(d, [{ word: "geese", marks: ["x", "g", "x", "x", "x"] }]).map((h) => h.word);
  for (const w of g) assert.equal(w.split("e").length - 1, 1, w);
});

test("spelling bee and letter boxed", () => {
  const sb = spellingBee(d, "abcdeil", "a");
  assert.ok(sb.length > 0);
  for (const h of sb) { assert.ok(h.word.includes("a") && h.word.length >= 4); assert.ok([...h.word].every((ch) => "abcdeil".includes(ch))); }
  const sides = ["tlo", "rcb", "ime", "anp"];
  const words = letterBoxedWords(d, sides);
  for (const h of words) for (let i = 1; i < h.word.length; i++) assert.notEqual(sides.findIndex((s) => s.includes(h.word[i])), sides.findIndex((s) => s.includes(h.word[i - 1])));
  const pairs = letterBoxedPairs(words, sides);
  for (const [a, b] of pairs) { assert.equal(a.at(-1), b[0]); assert.equal(new Set(a + b).size >= 12, true); }
});

test("lists", () => {
  const entries = Object.entries(JSON.parse(fs.readFileSync(new URL("../data/words.json", import.meta.url), "utf8"))) as [string, number][];
  const l = listWords(entries, { minLen: 5, maxLen: 5, starts: "s" });
  assert.ok(l.common.length > 200 && l.common.every((w) => w.length === 5 && w[0] === "s"));
});

test("blocklist: no blocked word in the dictionary, ordinary look-alikes kept", () => {
  const tokens = fs.readFileSync(new URL("../scripts/blocklist.txt", import.meta.url), "utf8").split("\n").filter((l) => l && !l.startsWith("#")).flatMap((l) => l.trim().split(/\s+/));
  const exact = tokens.filter((t) => !t.startsWith("~")), roots = tokens.filter((t) => t.startsWith("~")).map((t) => t.slice(1));
  const bad = d.words.filter((w) => exact.includes(w) || roots.some((r) => w.includes(r)));
  assert.deepEqual(bad, []);
  for (const w of ["wristwatch", "prickly", "swanky", "niggle", "retardant", "saltwater", "pricked", "colour", "cafe"]) assert.ok(d.tier.has(w), w);
});

test("rack parsing: only ? and * are blanks", async () => {
  const { parseRack } = await import("../lib/solve.ts");
  assert.deepEqual(parseRack("a b_c."), { letters: "abc", blanks: 0 });
  assert.deepEqual(parseRack("ab??*?"), { letters: "ab", blanks: 3 });
  assert.ok(!anagrams(d, "listen").some((h) => h.word === "listen"));
});
