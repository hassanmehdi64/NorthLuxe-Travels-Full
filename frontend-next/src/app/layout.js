import "./globals.css";
import Providers from "./providers";
import { Suspense } from "react";

export const metadata = {
  title: "North Luxe",
  description: "Luxury tours and travel experiences",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><Providers><Suspense fallback={null}>{children}</Suspense></Providers></body>
    </html>
  );
}
