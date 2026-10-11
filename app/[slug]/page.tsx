import type { Metadata } from "next";
import { metadataFor, paramsAtDepth, render } from "@/lib/route";

type P = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => paramsAtDepth(1);
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  return metadataFor([slug]);
}
export default async function Page({ params }: P) {
  const { slug } = await params;
  return render([slug]);
}
