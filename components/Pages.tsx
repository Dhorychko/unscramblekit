import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "./JsonLd";
import ToolFor from "./ToolFor";
import { TOOLS, TOOL_BY_KEY, SUB_LENGTHS, type ListItem, type ToolItem } from "@/lib/catalog";
import { TOOL_CONTENT, listContent, type Content } from "@/lib/content";
import { THIN, allLists, listData } from "@/lib/lists";
import { SITE, OG_BASE } from "@/lib/site";

export function refOf(key: string): { path: string; title: string } | null {
  const t = TOOL_BY_KEY[key];
  if (t) return { path: t.path, title: t.title };
  const l = allLists().find((x) => x.key === key);
  return l ? { path: l.path, title: l.title } : null;
}

function Article({ c, children }: { c: Content; children?: React.ReactNode }) {
  const related = c.related.map(refOf).filter(Boolean) as { path: string; title: string }[];
  return (
    <div className="wrap article">
      <article className="prose">
        {children}
        <h2>How to use it</h2>
        <ol>{c.steps.map((s) => <li key={s}>{s}</li>)}</ol>
        {c.tips.length > 0 && <><h2>Tips</h2><ul>{c.tips.map((t) => <li key={t}>{t}</li>)}</ul></>}
        <h2>Questions</h2>
        {c.faq.map((f) => <details className="faq" key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
      </article>
      <aside className="side">
        <h2>Related</h2>
        <ul>{related.map((r) => <li key={r.path}><Link prefetch={false} href={r.path}>{r.title}</Link></li>)}</ul>
        <h2>All solvers</h2>
        <ul>{TOOLS.filter((t) => !c.related.includes(t.key)).map((t) => <li key={t.key}><Link prefetch={false} href={t.path}>{t.title}</Link></li>)}</ul>
      </aside>
    </div>
  );
}

const crumbsLd = (crumbs: [string, string][]) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE.url}${p}` })) });
const faqLd = (c: Content) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });

const TOOL_TITLES: Record<string, string> = {
  home: "Unscramble Words: Word Unscrambler & Finder",
  "anagram-solver": "Anagram Solver: Find Every Anagram of a Word",
  "wordle-solver": "Wordle Solver: Find Possible Answers",
  "scrabble-word-finder": "Scrabble Word Finder: Words From Your Rack",
  "words-with-friends-helper": "Words With Friends Cheat & Word Helper",
  "jumble-solver": "Jumble Solver: Unscramble Jumble Words",
  "spelling-bee-solver": "Spelling Bee Solver: All Words & Pangrams",
  "letter-boxed-solver": "Letter Boxed Solver: Two-Word Solutions",
};

export function toolMetadata(t: ToolItem): Metadata {
  const c = TOOL_CONTENT[t.key];
  const title = `${TOOL_TITLES[t.key]} | ${SITE.name}`;
  return { title: { absolute: title }, description: c.meta, alternates: { canonical: t.path }, openGraph: { ...OG_BASE, title, description: c.meta, url: t.path } };
}

export function ToolPage({ tool }: { tool: ToolItem }) {
  const c = TOOL_CONTENT[tool.key];
  const crumbs: [string, string][] = tool.key === "home" ? [["Home", "/"]] : [["Home", "/"], [tool.title, tool.path]];
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "WebApplication", name: tool.h1, url: `${SITE.url}${tool.path}`, applicationCategory: "GameApplication", operatingSystem: "Any", description: c.meta, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
        ...(tool.key === "home" ? [{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: `${SITE.url}/` }] : [crumbsLd(crumbs)]),
        faqLd(c),
      ]} />
      <div className="hero">
        <div className="wrap narrow">
          {tool.key !== "home" && <nav className="crumbs" aria-label="Breadcrumb"><Link prefetch={false} href="/">Home</Link></nav>}
          <h1>{tool.h1}</h1>
          <p className="lede">{c.intro}</p>
          <ToolFor tool={tool} />
        </div>
      </div>
      <Article c={c}>
        {tool.key === "home" && (
          <>
            <h2>Word lists</h2>
            <ul className="chip-list">
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <li key={n}><Link prefetch={false} href={`/${n}-letter-words/`}>{n}-letter words</Link></li>)}
              {["q", "j", "x", "z"].map((l) => <li key={l}><Link prefetch={false} href={`/words-with-${l}/`}>Words with {l.toUpperCase()}</Link></li>)}
            </ul>
          </>
        )}
      </Article>
    </>
  );
}

export function listMetadata(it: ListItem): Metadata {
  const d = listData(it);
  const c = listContent(it, d);
  const title = d.total >= THIN ? `${it.title} (${d.total.toLocaleString("en-US")} Words)` : it.title;
  return { title, ...(d.total < THIN ? { robots: { index: false, follow: true } } : {}), description: c.meta, alternates: { canonical: it.path }, openGraph: { ...OG_BASE, title: `${title} | ${SITE.name}`, description: c.meta, url: it.path } };
}

const AZ = "abcdefghijklmnopqrstuvwxyz".split("");

export function ListPage({ it }: { it: ListItem }) {
  const d = listData(it);
  const c = listContent(it, d);
  const lists = allLists();
  const isSub = it.kind === "start" || it.kind === "end" || it.kind === "with";
  const isCombo = it.kind === "startend";
  const parent = isSub || isCombo ? lists.find((x) => x.key === `${it.n}-letter-words`) : undefined;
  const crumbs: [string, string][] = [["Home", "/"], ...(parent ? [[parent.title, parent.path] as [string, string]] : []), [it.title, it.path]];
  // Letter rows for a given length: each present letter links to its subpage; missing letters are shown greyed (no dead links).
  const nav = (kind: "start" | "end" | "with", label: string, navN: number) => (
    <div className="letter-nav"><span className="small muted">{label}</span>
      {AZ.map((l) => { const x = lists.find((y) => y.kind === kind && y.n === navN && y.letter === l); return x ? <Link prefetch={false} key={l} href={x.path} className={x.key === it.key ? "on" : undefined} aria-current={x.key === it.key ? "page" : undefined}>{l.toUpperCase()}</Link> : <span key={l} className="off">{l.toUpperCase()}</span>; })}
    </div>
  );
  // On a subpage, show its own length's rows; on a length hub that has subpages, surface them too (internal links + discovery).
  const navN = it.n ?? 5;
  const showNavs = isSub || (it.kind === "len" && SUB_LENGTHS.includes(it.n!));
  // Rows for the start+end combo cluster (and links to it from the plain start/end pages).
  const comboRow = (label: string, find: (l: string) => ListItem | undefined) => (
    <div className="letter-nav"><span className="small muted">{label}</span>
      {AZ.map((l) => { const x = find(l); return x ? <Link prefetch={false} key={l} href={x.path} className={x.key === it.key ? "on" : undefined} aria-current={x.key === it.key ? "page" : undefined}>{l.toUpperCase()}</Link> : <span key={l} className="off">{l.toUpperCase()}</span>; })}
    </div>
  );
  const byStartEnd = (l1: string, l2: string) => lists.find((y) => y.kind === "startend" && y.letter === l1 && y.letter2 === l2);
  return (
    <>
      <JsonLd data={[crumbsLd(crumbs), faqLd(c)]} />
      <div className="hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">{crumbs.slice(0, -1).map(([n, p], i) => <span key={p}>{i > 0 && " / "}<Link prefetch={false} href={p}>{n}</Link></span>)}</nav>
          <h1>{it.h1}</h1>
          <p className="lede">{c.intro}</p>
          {it.kind === "len" && <div className="letter-nav"><span className="small muted">Length</span>{[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <Link prefetch={false} key={n} href={`/${n}-letter-words/`} className={n === it.n ? "on" : undefined}>{n}</Link>)}</div>}
          {isSub && <div className="letter-nav"><span className="small muted">Length</span>{SUB_LENGTHS.map((m) => { const x = lists.find((y) => y.kind === it.kind && y.n === m && y.letter === it.letter); return x ? <Link prefetch={false} key={m} href={x.path} className={m === it.n ? "on" : undefined} aria-current={m === it.n ? "page" : undefined}>{m}</Link> : <span key={m} className="off">{m}</span>; })}</div>}
          {showNavs && <>{nav("start", "Starting with", navN)}{nav("end", "Ending in", navN)}{nav("with", "Containing", navN)}</>}
          {isCombo && <>{comboRow(`Start ${it.letter!.toUpperCase()} · ending in`, (l) => byStartEnd(it.letter!, l))}{comboRow(`End ${it.letter2!.toUpperCase()} · starting with`, (l) => byStartEnd(l, it.letter2!))}</>}
          {it.kind === "start" && it.n === 5 && comboRow("Also ending in", (l) => byStartEnd(it.letter!, l))}
          {it.kind === "end" && it.n === 5 && comboRow("Also starting with", (l) => byStartEnd(l, it.letter!))}
        </div>
      </div>
      <div className="wrap lists">
        {d.common.length > 0 && (
          <section>
            <h2>Common words <span className="muted small">({d.commonTotal.toLocaleString("en-US")})</span></h2>
            {d.common.length < d.commonTotal && <p className="small muted">Showing {d.common.length.toLocaleString("en-US")} of {d.commonTotal.toLocaleString("en-US")} common words, picked from the most frequent ones across the whole alphabet.</p>}
            <ul className="wordlist big">{d.common.map((w) => <li key={w}>{w}</li>)}</ul>
          </section>
        )}
        {d.more.length > 0 && (
          <section>
            <h2>Less common and rare words <span className="muted small">({d.moreTotal.toLocaleString("en-US")})</span></h2>
            {d.more.length < d.moreTotal && <p className="small muted">A selection of {d.more.length.toLocaleString("en-US")}; the rest are mostly technical or very rare.</p>}
            <ul className="wordlist">{d.more.map((w) => <li key={w}>{w}</li>)}</ul>
          </section>
        )}
      </div>
      <Article c={c} />
    </>
  );
}
