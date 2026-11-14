import "./globals.css";
import { Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import Providers from "./providers";
import { Suspense } from "react";

// Public site: one compact, modern family for headings and body.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

// Admin dashboard keeps its existing typeface.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata = {
  title: "North Luxe",
  description: "Luxury tours and travel experiences",
  icons: { icon: "/north-luxe-logo.png" },
};

export default function RootLayout({ children }) {
  return (
    // Browser extensions (e.g. QuillBot's data-qb-installed) add attributes to <html>/<body>
    // before React hydrates. suppressHydrationWarning ignores attribute differences on these
    // two elements only; mismatches inside the page are still reported.
    <html lang="en" className={`${jakarta.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning><Providers><Suspense fallback={null}>{children}</Suspense></Providers></body>
    </html>
  );
}
