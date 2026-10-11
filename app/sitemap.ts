import type { MetadataRoute } from "next";
import { TOOLS } from "@/lib/catalog";
import { THIN, allLists, listData } from "@/lib/lists";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-09");
  return [...TOOLS.map((t) => t.path), ...allLists().filter((l) => listData(l).total >= THIN).map((l) => l.path), "/about/", "/privacy/", "/contact/"].map((p) => ({ url: `${SITE.url}${p}`, lastModified }));
}
