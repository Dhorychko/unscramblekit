import localFont from "next/font/local";

export const display = localFont({
  src: [{ path: "./fonts/outfit-latin-700-normal.woff2", weight: "700", style: "normal" }],
  variable: "--font-display",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});
