// Shared logic for the routes app/[slug] and app/[slug]/[sub].
// (Two plain dynamic folders instead of a catch-all "[...path]" folder, whose name GitHub's web upload rejects.)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListPage, ToolPage, listMetadata, toolMetadata } from "@/components/Pages";
import { TOOLS } from "@/lib/catalog";
import { allLists } from "@/lib/lists";

const segs = (path: string) => path.split("/").filter(Boolean);
export const paramsAtDepth = (depth: 1 | 2) =>
  [...TOOLS.filter((t) => t.key !== "home"), ...allLists()].map((x) => segs(x.path)).filter((p) => p.length === depth)
    .map((p) => (depth === 1 ? { slug: p[0] } : { slug: p[0], sub: p[1] }));
const find = (p: string[]) => {
  const path = `/${p.join("/")}/`;
  return { tool: TOOLS.find((t) => t.path === path), list: allLists().find((l) => l.path === path) };
};

export function metadataFor(p: string[]): Metadata {
  const { tool, list } = find(p);
  return tool ? toolMetadata(tool) : list ? listMetadata(list) : {};
}
export function render(p: string[]) {
  const { tool, list } = find(p);
  if (tool) return <ToolPage tool={tool} />;
  if (list) return <ListPage it={list} />;
  notFound();
}
