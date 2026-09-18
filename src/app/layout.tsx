import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { AttributionFooter } from "@/app/components/layout/AttributionFooter";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PaceBeat",
  description: "Génère une playlist de course qui suit ta courbe d'intensité idéale.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-canvas font-body text-ink-high">
        <div className="flex flex-1 flex-col">{children}</div>
        <AttributionFooter />
      </body>
    </html>
  );
}
