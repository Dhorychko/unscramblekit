import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${SITE.name}: report a bug, suggest a new tool or ask a question about the site.`,
  alternates: { canonical: "/contact/" },
};

export default function Contact() {
  const email = `hello@${SITE.domain}`;
  return (
    <div className="wrap article" style={{ paddingTop: 24 }}>
      <article className="prose">
        <h1>Contact</h1>
        <p className="lede">Found a bug, a wrong answer or a missing option? We read every message.</p>
        <p>Email: <a href={`mailto:${email}`}>{email}</a></p>
        <p>To help us fix a problem quickly, include the page address, the settings you used and, if you can, a screenshot. Suggestions for new templates and tools are welcome too.</p>
        <p>See also: <Link prefetch={false} href="/about/">About</Link> · <Link prefetch={false} href="/privacy/">Privacy Policy</Link></p>
      </article>
    </div>
  );
}
