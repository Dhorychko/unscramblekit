"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  WWF, SCRABBLE, BINGO, anagrams, parseRack, bestGuesses, clean, isCommon, letterBoxedPairs, letterBoxedWords, parseDict, spellingBee, unscramble, wordleCandidates,
  type Dict, type Guess, type Hit, type Mark,
} from "@/lib/solve";
import { DICT_FILE } from "@/lib/dictFile";

// ---------------------------------------------------------------- Dictionary loading (shared, once per page)
let dictPromise: Promise<Dict> | null = null;
function loadDict(): Promise<Dict> {
  if (!dictPromise) dictPromise = fetch(DICT_FILE).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.text(); }).then(parseDict);
  return dictPromise;
}
/** Loads the word list. With `lazy`, waits for the first interaction (or a few idle seconds) so an empty tool page stays light. */
function useDict(lazy = false) {
  const [dict, setDict] = useState<Dict | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let live = true;
    const go = () => { cleanup(); loadDict().then((d) => live && setDict(d)).catch(() => { dictPromise = null; if (live) setError(true); }); };
    const evs = ["pointerdown", "keydown", "focusin", "touchstart"] as const;
    let timer = 0;
    const cleanup = () => { evs.forEach((e) => window.removeEventListener(e, go)); window.clearTimeout(timer); };
    if (!lazy || dictPromise) go();
    else { evs.forEach((e) => window.addEventListener(e, go, { once: true, passive: true })); timer = window.setTimeout(go, 6000); }
    return () => { live = false; cleanup(); };
  }, [lazy]);
  return { dict, error };
}

function Status({ dict, error }: { dict: Dict | null; error: boolean }) {
  if (error) return <p className="warn" role="alert">The word list didn&apos;t load. Check your connection and reload the page.</p>;
  if (!dict) return <p className="muted small">Loading the word list…</p>;
  return null;
}

export function Tiles({ word, size = "md", blanks = "" }: { word: string; size?: "sm" | "md" | "lg"; blanks?: string }) {
  const b = blanks.split("");
  return (
    <span className={`tiles tiles-${size}`} role="img" aria-label={word.toUpperCase()}>
      {word.split("").map((ch, i) => {
        const j = b.indexOf(ch);
        const blank = j >= 0;
        if (blank) b.splice(j, 1);
        return <span key={i} className={`tile${blank ? " blank" : ""}`} aria-hidden="true">{ch.toUpperCase()}</span>;
      })}
    </span>
  );
}

const MAX_SHOW = 400;
const plural = (n: number, one: string, many = one + "s") => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

/** A word with letters that came from blank tiles shown underlined. */
function WordText({ h }: { h: Hit }) {
  if (!h.blanks) return <>{h.word}</>;
  const b = h.blanks.split("");
  return <>{h.word.split("").map((ch, i) => { const j = b.indexOf(ch); if (j < 0) return ch; b.splice(j, 1); return <u key={i} className="from-blank">{ch}</u>; })}</>;
}

function Results({ hits, showScore, empty, groupBy = "length", bonus = 0 }: { hits: Hit[]; showScore?: boolean; empty: string; groupBy?: "length" | "none"; bonus?: number }) {
  const [commonOnly, setCommonOnly] = useState(false);
  const [byPoints, setByPoints] = useState(false);
  if (!hits.length) return <p className="muted">{empty}</p>;
  let list = commonOnly ? hits.filter((h) => isCommon(h.tier)) : hits;
  const total = (h: Hit) => (h.score ?? 0) + (h.bingo ? bonus : 0);
  if (showScore && byPoints) list = [...list].sort((a, b) => total(b) - total(a) || b.word.length - a.word.length || a.word.localeCompare(b.word));
  const grouped = groupBy === "length" && !(showScore && byPoints);
  const groups = grouped ? Array.from(new Set(list.map((h) => h.word.length))).sort((a, b) => b - a) : [0];
  let shown = 0;
  return (
    <div className="results">
      <div className="results-head">
        <h2 className="results-title">{plural(list.length, "word")}</h2>
        {showScore && (
          <span className="seg" role="group" aria-label="Sort results">
            <button type="button" aria-pressed={!byPoints} onClick={() => setByPoints(false)}>By length</button>
            <button type="button" aria-pressed={byPoints} onClick={() => setByPoints(true)}>By points</button>
          </span>
        )}
        <label className="check"><input type="checkbox" checked={commonOnly} onChange={(e) => setCommonOnly(e.target.checked)} />Common words only</label>
      </div>
      {!list.length && <p className="muted">None of these are common words. Untick &ldquo;Common words only&rdquo; to see all {plural(hits.length, "result")}.</p>}
      {groups.map((len) => {
        const g = grouped ? list.filter((h) => h.word.length === len) : list;
        if (shown >= MAX_SHOW || !g.length) return null;
        const take = g.slice(0, MAX_SHOW - shown);
        shown += take.length;
        return (
          <section key={len} className="rgroup">
            {grouped && <h3>{len}-letter words <span className="muted small">({g.length})</span></h3>}
            <ul className="wordlist">
              {take.map((h) => (
                <li key={h.word} className={isCommon(h.tier) ? "common" : "rare"}>
                  <WordText h={h} />
                  {showScore && h.score !== undefined && <sub>{h.score}{h.bingo && bonus ? <span className="bingo">+{bonus}</span> : null}</sub>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {list.length > MAX_SHOW && <p className="muted small">Showing the first {MAX_SHOW}. Add a filter to narrow the list.</p>}
      <p className="legend small muted"><span className="common-dot" /> bold = common word{showScore ? "; small number = points before board bonuses" : ""}{showScore && bonus ? `; +${bonus} = bonus for using all 7 tiles` : ""}{hits.some((h) => h.blanks) ? "; underlined letter = played with a blank tile (0 points)" : ""}</p>
    </div>
  );
}

// ---------------------------------------------------------------- Unscramble family
export type UMode = "unscramble" | "anagram" | "scrabble" | "wwf";
const PLACEHOLDER: Record<UMode, string> = { unscramble: "e.g. RATES", anagram: "e.g. LISTEN", scrabble: "your tiles, ? for blank", wwf: "your tiles, ? for blank" };

export function UnscrambleTool({ mode, initial = "" }: { mode: UMode; initial?: string }) {
  const { dict, error } = useDict(!initial);
  const [input, setInput] = useState(initial);
  const [starts, setStarts] = useState("");
  const [ends, setEnds] = useState("");
  const [contains, setContains] = useState("");
  const [len, setLen] = useState("");
  const [open, setOpen] = useState(false);
  const game = mode === "scrabble" || mode === "wwf";
  const values = mode === "scrabble" ? SCRABBLE : mode === "wwf" ? WWF : undefined;
  const bonus = mode === "scrabble" ? BINGO.scrabble : mode === "wwf" ? BINGO.wwf : 0;
  const hits = useMemo(() => {
    if (!dict || !clean(input.replace(/[?*]/g, "a"))) return [];
    if (mode === "anagram") return anagrams(dict, input);
    const n = Number(len) || undefined;
    const f = { starts: clean(starts), ends: clean(ends), contains: clean(contains), minLen: n ?? 2, maxLen: n };
    if (!game) return unscramble(dict, input, f, values);
    // In Scrabble and Words With Friends the filter letters are already on the board, so they are added to the rack.
    const board = f.starts + f.contains + f.ends;
    const rack = parseRack(input);
    const res = unscramble(dict, input + board, f, values);
    const fromRack = rack.letters.length + rack.blanks;
    return res.map((h) => ({ ...h, bingo: fromRack >= 7 && h.word.length - board.length >= 7 }));
  }, [dict, input, starts, ends, contains, len, mode, values, game]);
  const letters = input.toLowerCase().replace(/[^a-z?*]/g, "").slice(0, 15);
  return (
    <div className="solver">
      <label className="rack" htmlFor="letters">
        <span className="sr-only">Letters</span>
        <input id="letters" type="text" inputMode="text" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={18}
          value={input} placeholder={PLACEHOLDER[mode]} onChange={(e) => setInput(e.target.value.slice(0, 18))} />
      </label>
      <div className="rack-tiles" aria-hidden="true">{letters ? <Tiles word={letters.replace(/[?*]/g, " ")} size="lg" /> : <span className="muted small">Type up to 15 letters{game ? ". Use ? for a blank tile (up to 3)." : "."}</span>}</div>
      {mode !== "anagram" && (
        <details className="filters" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
          <summary>{game ? "Board letters: starts with, ends with, contains, length" : "Filters: starts with, ends with, contains, length"}</summary>
          {game && <p className="small muted">Letters typed here are treated as tiles already on the board and are added to your rack.</p>}
          <div className="filter-grid">
            <label className="field"><span>Starts with</span><input type="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={starts} onChange={(e) => setStarts(e.target.value.slice(0, 8))} /></label>
            <label className="field"><span>Ends with</span><input type="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={ends} onChange={(e) => setEnds(e.target.value.slice(0, 8))} /></label>
            <label className="field"><span>Contains</span><input type="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={contains} onChange={(e) => setContains(e.target.value.slice(0, 8))} /></label>
            <label className="field"><span>Length</span>
              <select value={len} onChange={(e) => setLen(e.target.value)}>
                <option value="">Any</option>{Array.from({ length: 14 }, (_, i) => i + 2).map((n) => <option key={n} value={n}>{n} letters</option>)}
              </select>
            </label>
          </div>
        </details>
      )}
      <div className="out">
      {/* Nothing shows until letters are typed, so the area doesn't jump while the word list loads. */}
      {(letters || error) && <Status dict={dict} error={error} />}
      {dict && letters && <Results hits={hits} showScore={!!values} bonus={bonus} groupBy="length" empty={mode === "anagram" ? "No other single word uses exactly those letters." : "No words found. Check the letters or remove a filter."} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Jumble
export function JumbleTool() {
  const { dict, error } = useDict();
  const [rows, setRows] = useState(["lnaep", "gdreun", "tihcne", "hcaeb"]);
  return (
    <div className="solver">
      <Status dict={dict} error={error} />
      <div className="jumble-rows">
        {rows.map((r, i) => {
          const hits = dict && clean(r).length >= 2 ? anagrams(dict, r) : [];
          return (
            <div className="jumble-row" key={i}>
              <label className="field"><span>Jumble {i + 1}</span>
                <input type="text" value={r} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={15} onChange={(e) => setRows((x) => x.map((v, j) => (j === i ? e.target.value : v)))} />
              </label>
              <div className="jumble-ans" aria-live="polite">
                {!clean(r) ? <span className="muted small">—</span> : !dict ? null : hits.length ? hits.slice(0, 6).map((h) => <Tiles key={h.word} word={h.word} size="sm" />) : <span className="muted small">No match</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="actions-row">
        <button type="button" className="btn-ghost" onClick={() => setRows((x) => (x.length < 8 ? [...x, ""] : x))}>Add a word</button>
        <button type="button" className="btn-ghost" onClick={() => setRows(["", "", "", ""])}>Clear</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Wordle
const NEXT: Record<Mark, Mark> = { x: "y", y: "g", g: "x" };
const MARK_LABEL: Record<Mark, string> = { x: "gray", y: "yellow", g: "green" };

export function WordleTool({ len = 5 }: { len?: number }) {
  const { dict, error } = useDict();
  const [rows, setRows] = useState<Guess[]>([{ word: "crane", marks: ["x", "y", "x", "x", "g"] }]);
  const [demo, setDemo] = useState(true);
  const setWord = (i: number, w: string) => { setDemo(false); setRows((r) => r.map((g, j) => (j === i ? { ...g, word: clean(w).slice(0, len) } : g))); };
  const cycle = (i: number, k: number) => { setDemo(false); setRows((r) => r.map((g, j) => (j === i ? { ...g, marks: g.marks.map((m, q) => (q === k ? NEXT[m] : m)) as Mark[] } : g))); };
  const full = rows.filter((g) => g.word.length === len);
  const cands = useMemo(() => (dict ? wordleCandidates(dict, full, len) : []), [dict, JSON.stringify(full), len]); // eslint-disable-line react-hooks/exhaustive-deps
  const best = useMemo(() => bestGuesses(cands.filter((c) => isCommon(c.tier)).length ? cands.filter((c) => isCommon(c.tier)) : cands, 6), [cands]);
  return (
    <div className="solver">
      <p className="small muted">Type each guess, then tap its letters to match the colors you got: gray → yellow → green.{demo && <> <strong>The first row is an example;</strong> replace it with your own guess.</>}</p>
      <div className="wordle-rows">
        {rows.map((g, i) => (
          <div className="wordle-row" key={i}>
            <input type="text" aria-label={`Guess ${i + 1}`} value={g.word} maxLength={len} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} onChange={(e) => setWord(i, e.target.value)} />
            <div className="wtiles">
              {Array.from({ length: len }, (_, k) => (
                <button type="button" key={k} className={`wtile m-${g.marks[k]}`} onClick={() => cycle(i, k)} disabled={!g.word[k]}
                  aria-label={`Letter ${k + 1}${g.word[k] ? ` ${g.word[k].toUpperCase()}` : ""}: ${MARK_LABEL[g.marks[k]]}. Tap to change.`}>
                  {g.word[k]?.toUpperCase() ?? ""}
                </button>
              ))}
            </div>
            <button type="button" className="btn-x" aria-label={`Remove guess ${i + 1}`} onClick={() => setRows((r) => r.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
      </div>
      <div className="actions-row">
        {rows.length < 6 && <button type="button" className="btn" onClick={() => setRows((r) => [...r, { word: "", marks: Array(len).fill("x") as Mark[] }])}>Add a guess</button>}
        <button type="button" className="btn-ghost" onClick={() => { setDemo(false); setRows([{ word: "", marks: Array(len).fill("x") as Mark[] }]); }}>Start over</button>
      </div>
      <div className="out">
      <Status dict={dict} error={error} />
      {dict && (
        <>
          {cands.length > 0 && best.length > 0 && (
            <div className="best"><h2 className="h-sm">Good next guesses</h2><div className="best-row">{best.map((w) => <Tiles key={w} word={w} size="sm" />)}</div></div>
          )}
          <Results hits={cands} groupBy="none" empty="No words match. Double-check the colors: a letter marked gray can't appear again unless it's also green or yellow." />
        </>
      )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Spelling Bee
export function BeeTool() {
  const { dict, error } = useDict();
  const [center, setCenter] = useState("a");
  const [outer, setOuter] = useState("cbinet");
  const hits = useMemo(() => (dict && clean(center) ? spellingBee(dict, outer + center, center) : []), [dict, center, outer]);
  const pangrams = hits.filter((h) => h.pangram);
  return (
    <div className="solver">
      <div className="bee-inputs">
        <label className="field"><span>Center letter</span><input className="center-in" type="text" maxLength={1} value={center} onChange={(e) => setCenter(clean(e.target.value).slice(0, 1))} /></label>
        <label className="field"><span>Six outer letters</span><input type="text" maxLength={8} value={outer} onChange={(e) => setOuter(clean(e.target.value).slice(0, 6))} /></label>
      </div>
      <div className="out">
      <Status dict={dict} error={error} />
      {dict && pangrams.length > 0 && <div className="best"><h2 className="h-sm">Pangrams (use all 7 letters)</h2><div className="best-row">{pangrams.map((h) => <Tiles key={h.word} word={h.word} size="sm" />)}</div></div>}
      {dict && <Results hits={hits} groupBy="length" empty="No words found. Enter one center letter and six others." />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Letter Boxed
export function BoxTool() {
  const { dict, error } = useDict();
  const [sides, setSides] = useState(["tlo", "rcb", "ime", "anp"]);
  const words = useMemo(() => (dict && sides.every((s) => clean(s).length === 3) ? letterBoxedWords(dict, sides) : []), [dict, sides]);
  const pairs = useMemo(() => letterBoxedPairs(words, sides, 24), [words, sides]);
  const names = ["Top", "Right", "Bottom", "Left"];
  return (
    <div className="solver">
      <div className="box-inputs">
        {sides.map((s, i) => (
          <label className="field" key={i}><span>{names[i]} side</span>
            <input type="text" maxLength={3} value={s} onChange={(e) => setSides((x) => x.map((v, j) => (j === i ? clean(e.target.value).slice(0, 3) : v)))} />
          </label>
        ))}
      </div>
      <div className="out">
      <Status dict={dict} error={error} />
      {dict && !sides.every((s) => clean(s).length === 3) && <p className="muted">Enter three letters for each side.</p>}
      {dict && pairs.length > 0 && (
        <div className="best"><h2 className="h-sm">Two-word solutions</h2>
          <ul className="pairs">{pairs.map(([a, b]) => <li key={a + b}><b>{a.toUpperCase()}</b> <span aria-hidden="true">→</span><span className="sr-only">then</span> <b>{b.toUpperCase()}</b></li>)}</ul>
        </div>
      )}
      {dict && sides.every((s) => clean(s).length === 3) && <Results hits={words} groupBy="length" empty="No valid words for these letters." />}
      </div>
    </div>
  );
}

export function ToolFrame({ children }: { children: ReactNode }) { return <div className="tool-frame">{children}</div>; }
