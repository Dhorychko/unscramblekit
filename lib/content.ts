import type { ListItem } from "./catalog";
import type { ListData } from "./lists";

export type Content = { meta: string; intro: string; steps: string[]; tips: string[]; faq: { q: string; a: string }[]; related: string[] };

export const TOOL_CONTENT: Record<string, Content> = {
  home: {
    meta: "Unscramble words from any letters: type up to 15 letters and see every word you can make, longest first. Filter by start, end or length. Free, instant.",
    intro: "Type your letters and get every word they make, from the longest down to two letters, with common words in bold. Use ? for a blank tile, and filter by starting letters, ending letters or length.",
    steps: ["Type the letters you have (up to 15). Add ? for a blank or wildcard.", "Words appear instantly, grouped by length.", "Open Filters to find words that start or end with certain letters, or have a set length."],
    tips: [
      "Common words are shown in bold; tick \"Common words only\" to hide obscure ones.",
      "Look for common endings like -ING, -ED, -ER and -EST, and beginnings like RE- and UN-, to spot long words fast.",
      "The word list is based on SCOWL, a large open-source English word list (about 110,000 words). Offensive words are left out.",
    ],
    faq: [
      { q: "How do I unscramble letters?", a: "Type them in the box above. The unscrambler checks every word in its list against your letters and shows all the words you can spell, longest first." },
      { q: "Can I use a blank tile?", a: "Yes. Type ? (or *) for each blank, up to three. Letters filled in by a blank are underlined." },
      { q: "What is the longest word I can make?", a: "It's the first word in the list. If it uses all your letters, it's also an anagram of them." },
    ],
    related: ["anagram-solver", "scrabble-word-finder", "jumble-solver", "wordle-solver"],
  },
  "anagram-solver": {
    meta: "Free anagram solver: type a word or letters and find every English word that uses exactly the same letters, like listen → silent, enlist, tinsel.",
    intro: "An anagram uses exactly the same letters as the original, rearranged: LISTEN becomes SILENT, ENLIST and TINSEL. Type a word or a set of letters to see all single-word anagrams.",
    steps: ["Type a word or letters.", "Every word using all of them appears below.", "Need shorter words too? Use the word unscrambler."],
    tips: ["Words with common letters (E, R, S, T, A) have the most anagrams: ARTS has RATS, STAR and TSAR.", "Anagrams are a staple of cryptic crosswords and newspaper scramble puzzles."],
    faq: [
      { q: "What is an anagram?", a: "A word or phrase made by rearranging all the letters of another, such as \"night\" and \"thing\"." },
      { q: "Does it find multi-word anagrams?", a: "This solver finds single words. For words made from some of the letters, use the unscrambler." },
    ],
    related: ["home", "jumble-solver", "scrabble-word-finder", "spelling-bee-solver"],
  },
  "wordle-solver": {
    meta: "Wordle solver and helper: enter your guesses and tap the tile colors to see every possible answer, plus the best next guesses. No spoilers until you ask.",
    intro: "Stuck on a Wordle? Enter your guesses and the colors you got, and the solver lists every word that still fits, plus next guesses that test the most common remaining letters.",
    steps: [
      "Type your first guess and tap each tile until it matches the game's color.",
      "Add your other guesses the same way.",
      "Pick from the possible answers (common words are in bold) or try a suggested next guess.",
    ],
    tips: [
      "A gray letter that is also yellow or green elsewhere in the same guess means the word has exactly that many of it. The solver handles this for you.",
      "Answers are usually common words, so start with the bold ones.",
      "Strong first guesses use frequent letters with no repeats, such as CRANE, SLATE or TRACE.",
    ],
    faq: [
      { q: "Is using a Wordle solver cheating?", a: "It's up to you. Many players use a helper only after they're stuck, or to learn better strategy after finishing the puzzle." },
      { q: "Does it know today's answer?", a: "No. It only filters words by the clues you enter, so it can't spoil the answer unless you narrow it down yourself." },
      { q: "What do the colors mean?", a: "Green: right letter, right spot. Yellow: the letter is in the word but in a different spot. Gray: the letter isn't in the word (or not again, if it's already marked elsewhere)." },
    ],
    related: ["5-letter-words", "home", "spelling-bee-solver", "letter-boxed-solver"],
  },
  "scrabble-word-finder": {
    meta: "Scrabble word finder: enter your rack (use ? for blanks) and see playable words sorted by length and points, with filters for board letters. Free.",
    intro: "Enter the tiles on your rack to see every word you can play, with its face-value score. Use ? for blank tiles, and the filters to fit a word around letters already on the board.",
    steps: ["Type your 7 tiles; use ? for a blank.", "Open Board letters and add a letter already on the board in Contains, Starts with or Ends with. It is added to your tiles automatically.", "Sort the words by length or by points; a +50 means the word uses all 7 tiles."],
    tips: [
      "Using all 7 tiles in one turn (a \"bingo\") earns a 50-point bonus.",
      "Blank tiles score 0 points, so their letters are left out of the score.",
      "Short words with J, Q, X or Z on a double or triple letter square often outscore long words.",
      "This list isn't an official Scrabble dictionary; check challenges against the official one for your game.",
    ],
    faq: [
      { q: "How are Scrabble points calculated here?", a: "The score is the face value of the tiles (E = 1, Q = 10 and so on) before board bonuses like double word or triple letter." },
      { q: "What are the two-letter Scrabble words?", a: "Common ones include QI, ZA, XI, XU, JO, KA, OX and AX. See the 2-letter words list for more." },
    ],
    related: ["words-with-friends-helper", "home", "2-letter-words", "words-with-q"],
  },
  "words-with-friends-helper": {
    meta: "Words With Friends helper: enter your tiles to find words and their points using Words With Friends letter values. Blanks and board filters included.",
    intro: "Find words for your Words With Friends rack, scored with the game's own tile values (for example J and Z are worth 10). Use ? for blank tiles and the filters to build off letters on the board.",
    steps: ["Type your tiles; ? for a blank.", "Add letters already on the board under Board letters; they are added to your tiles automatically.", "Sort by points to find the best play; +35 marks words that use all 7 tiles."],
    tips: ["Letter values differ from Scrabble: H is 3, B and C are 4, V is 5.", "Playing all seven tiles earns a 35-point bonus."],
    faq: [{ q: "Is this the official Words With Friends dictionary?", a: "No. It uses a large general English word list, so a few words may be accepted or rejected differently in the game." }],
    related: ["scrabble-word-finder", "home", "anagram-solver"],
  },
  "jumble-solver": {
    meta: "Jumble solver: type up to eight scrambled words and unscramble them all at once. Great for the daily newspaper Jumble puzzle and word scrambles.",
    intro: "Solve several scrambled words at once, like the four words in a daily Jumble puzzle. Type each jumble on its own line and the answers appear beside it.",
    steps: ["Type each scrambled word in its own box.", "Read the answers beside each one.", "Use the circled letters from the answers to solve the final pun yourself."],
    tips: ["If a jumble has more than one answer, the right one usually fits the cartoon's theme.", "For the final answer, put the circled letters into the anagram solver."],
    faq: [{ q: "How does the Jumble solver work?", a: "It finds every word that uses exactly the same letters as each jumble." }],
    related: ["anagram-solver", "home", "spelling-bee-solver"],
  },
  "spelling-bee-solver": {
    meta: "Spelling Bee solver: enter the center letter and six outer letters to see every word of four or more letters, with pangrams first. Free helper.",
    intro: "Enter the center letter and the six outer letters from the puzzle. The solver lists every word of four letters or more that uses the center letter and only those seven letters, with pangrams at the top.",
    steps: ["Type the center letter.", "Type the six outer letters.", "Pangrams (using all seven letters) are listed first."],
    tips: [
      "Words must be at least 4 letters, include the center letter, and can reuse letters.",
      "Scoring in the NYT game: 4-letter words are 1 point, longer words 1 point per letter, and pangrams get 7 extra.",
      "The game's own word list is curated, so a few words here may not be accepted, and it may accept a few that aren't here.",
    ],
    faq: [{ q: "What is a pangram in Spelling Bee?", a: "A word that uses every one of the seven letters at least once. Every puzzle has at least one." }],
    related: ["letter-boxed-solver", "wordle-solver", "anagram-solver"],
  },
  "letter-boxed-solver": {
    meta: "Letter Boxed solver: enter the 12 letters from the four sides and get valid words plus two-word solutions that use every letter. Free helper.",
    intro: "Enter the three letters on each side of the box. The solver finds words where consecutive letters never come from the same side, and two-word solutions that use all 12 letters.",
    steps: ["Type three letters for each side.", "See two-word solutions first, then all valid words.", "Remember: each word must start with the last letter of the previous one."],
    tips: ["Words with many different letters cover the box fastest.", "Most puzzles have at least one two-word solution; if none appear, build a three-word path from the word list."],
    faq: [{ q: "What are the rules of Letter Boxed?", a: "Make words of at least 3 letters by connecting letters around the box; consecutive letters can't be on the same side. Each new word starts with the last letter of the previous word, and you win by using all 12 letters." }],
    related: ["spelling-bee-solver", "wordle-solver", "home"],
  },
};

const fmt = (n: number) => n.toLocaleString("en-US");
/** Join whole sentences while they fit in 160 characters. */
function fitMeta(parts: string[], filler = ["Free, with no sign-up.", "Updated October 2026."]): string {
  let out = "";
  for (const p of [...parts, ...filler]) {
    const next = out ? `${out} ${p}` : p;
    if (next.length > 160) continue;
    if (out.length >= 125 && parts.indexOf(p) < 0) break;
    out = next;
  }
  return out;
}
const plural = (n: number, one: string, many: string) => `${fmt(n)} ${n === 1 ? one : many}`;
const U = (s: string) => s.toUpperCase();
const sample = (a: string[], k = 4) => a.slice(0, k).map(U).join(", ");

export function listContent(it: ListItem, d: ListData): Content {
  const L = U(it.letter ?? "");
  const top = d.posFreq.map((p) => p[0]?.[0]).filter(Boolean).map(U);
  const exampleCommon = d.common.length ? d.common.filter((_, i) => i % Math.max(1, Math.floor(d.common.length / 5)) === 0).slice(0, 5) : d.more.slice(0, 5);
  const common = fmt(d.commonTotal), total = fmt(d.total);
  const ex = sample(exampleCommon);
  switch (it.kind) {
    case "len": {
      const n = it.n!;
      return {
        meta: fitMeta([`${n}-letter words: all ${total} in our list, ${common} of them common.`, `Examples: ${ex}.`, n === 5 ? "Filter by first or last letter for Wordle." : "Or find words from your own letters."]),
        intro: `There are ${total} ${n}-letter words in our list, and ${common} of them are common everyday words${d.common.length ? `, like ${ex}` : ""}. Common words are listed first; less common and rare words follow.`,
        steps: ["Scan the common words first; most word-game answers come from them.", `Use the links to narrow ${n === 5 ? "5-letter words by first letter, last letter or a letter they contain" : "the list"}.`, "To find words from specific letters, use the word unscrambler."],
        tips: [
          ...(top.length ? [`The most frequent letter in each position of common ${n}-letter words: ${top.join(" · ")}.`] : []),
          ...(d.starters.length && n === 5 ? [`Strong Wordle openers from this list (five different frequent letters): ${d.starters.slice(0, 5).map(U).join(", ")}.`] : []),
          ...(n === 2 ? ["Two-letter words are the secret weapon in Scrabble and Words With Friends: they let you play parallel to other words for extra points.", "High-scoring two-letter plays: QI, ZA, XI, XU, JO, KA, OX and AX."] : []),
          ...(d.firstLetters.length ? [`Most common first letters: ${d.firstLetters.map(([l, c]) => `${U(l)} (${c})`).join(", ")}.`] : []),
        ],
        faq: [
          { q: `How many ${n}-letter words are there?`, a: `${total} in this word list, which is based on SCOWL (about 110,000 English words). About ${common} are common words.` },
          ...(n === 5 ? [{ q: "Are all of these valid Wordle answers?", a: "Wordle's answers are common words, so start with the first list. The game accepts many more words as guesses than it uses as answers." }] : []),
        ],
        related: n === 5 ? ["wordle-solver", "home", "scrabble-word-finder"] : ["home", "scrabble-word-finder", "anagram-solver"],
      };
    }
    case "start5":
    case "end5":
    case "with5": {
      const what = it.kind === "start5" ? `starting with ${L}` : it.kind === "end5" ? `ending in ${L}` : `with ${L}`;
      const whatLong = it.kind === "with5" ? `containing the letter ${L}` : what;
      return {
        meta: fitMeta([`${plural(d.total, "five-letter word", "five-letter words")} ${whatLong}${d.commonTotal ? `, ${common} of them common` : ""}.`, `Examples: ${ex}.`, "Common words come first, handy for Wordle."]),
        intro: `${plural(d.total, "five-letter word", "five-letter words")} ${whatLong}${d.commonTotal ? `, including ${plural(d.commonTotal, "common word", "common words")} such as ${ex}` : `, such as ${ex}`}. Common words come first because they are the likeliest Wordle answers.`,
        steps: ["Start with the common words.", "Cross out words with letters you've already ruled out.", "For green and yellow clues together, use the Wordle solver."],
        tips: d.total < 30 ? [] : [
          ...(top.length ? [`In common 5-letter words ${what}, the most frequent letter at each position is ${top.join(" · ")}.`] : []),
          ...(d.starters.length ? [`Good guesses to test more letters: ${d.starters.slice(0, 4).map(U).join(", ")}.`] : []),
        ],
        faq: [
          { q: `How many 5-letter words ${whatLong} are there?`, a: `${total} in this list, ${common} of them common.` },
          { q: "Which one is today's Wordle answer?", a: "This list doesn't know the daily answer. Enter your colored guesses in the Wordle solver to narrow it down." },
        ],
        related: ["wordle-solver", "5-letter-words", "home"],
      };
    }
    case "letter":
      return {
        meta: fitMeta([`${total} words with ${L}, up to 10 letters long and sorted shortest first.`, `Examples: ${sample(d.common.concat(d.more).sort((a, b) => a.length - b.length || a.localeCompare(b)), 5)}.`, "Handy for Scrabble and Words With Friends."]),
        intro: `${L} is one of the hardest letters to play and one of the most valuable in word games. Here are ${total} words of up to ten letters that contain ${L}, ${common} of them common, sorted from shortest to longest.`,
        steps: ["Short words are at the top of each section; they fit tight spots on a board.", "Use the Scrabble word finder to check which ones your rack can make."],
        tips: [
          ...(L === "Q" ? ["Words with Q but no U, like QI, QAT and FAQIR, are lifesavers in Scrabble."] : []),
          `${L} is worth ${({ Q: 10, J: 8, X: 8, Z: 10 } as Record<string, number>)[L]} points in Scrabble and ${({ Q: 10, J: 10, X: 8, Z: 10 } as Record<string, number>)[L]} in Words With Friends.`,
        ],
        faq: [{ q: `What are short words with ${L}?`, a: `The shortest are at the top of the list, for example ${sample(d.common.concat(d.more).sort((a, b) => a.length - b.length), 5)}.` }],
        related: ["scrabble-word-finder", "words-with-friends-helper", "2-letter-words"],
      };
  }
}
