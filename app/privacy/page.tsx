import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} handles data: tools run in your browser, nothing you type is uploaded, and how advertising cookies work on the site.`,
  alternates: { canonical: "/privacy/" },
};

export default function Privacy() {
  return (
    <div className="wrap article" style={{ paddingTop: 24 }}>
      <article className="prose">
        <h1>Privacy Policy</h1>
        <p className="lede">Last updated {SITE.updated}.</p>
        <h2>What you type stays on your device</h2>
        <p>Every tool on {SITE.name} runs in your browser. Letters, names, word lists and settings you enter are processed on your device and are not sent to us or stored on our servers. Some tools remember your last settings in your browser&apos;s local storage; clearing site data removes them.</p>
        <h2>Advertising</h2>
        <p>The site is free because it shows ads. Advertising partners such as Google may use cookies or similar technologies to show ads based on your visits to this and other websites. You can turn off personalized ads from Google at <a href="https://adssettings.google.com" rel="nofollow noopener">Google Ad Settings</a> and learn more at <a href="https://policies.google.com/technologies/ads" rel="nofollow noopener">How Google uses cookies in advertising</a>. Where required by law, you will be asked for consent before such cookies are used.</p>
        <h2>Server logs and hosting</h2>
        <p>Like most websites, our hosting provider records basic technical data (IP address, browser type, pages requested) to keep the site running and secure. We do not use these logs to identify you.</p>
        <h2>Children</h2>
        <p>The tools are suitable for classroom use and do not ask for personal information. We do not knowingly collect personal information from children.</p>
        <h2>Your choices</h2>
        <p>You can block or delete cookies in your browser settings. California, EU and UK residents can request information about data held about them using the contact details below; since we do not store what you type, there is usually nothing to return.</p>
        <h2>Contact</h2>
        <p>Questions about this policy: see the <Link prefetch={false} href="/contact/">contact page</Link>.</p>
      </article>
    </div>
  );
}
