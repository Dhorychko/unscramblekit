import type { Metadata } from "next";
import { metadataFor, paramsAtDepth, render } from "@/lib/route";

type P = { params: Promise<{ slug: string; sub: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => paramsAtDepth(2);
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug, sub } = await params;
  return metadataFor([slug, sub]);
}
export default async function Page({ params }: P) {
  const { slug, sub } = await params;
  return render([slug, sub]);
}
