import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans, Inter, Martian_Mono } from "next/font/google";
import "./globals.css";
import { SignInForm } from "@/app/components/landing/SignInForm";
import { AttributionFooter } from "@/app/components/layout/AttributionFooter";
import { auth, signOut } from "@/infrastructure/auth/authOptions";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
  axes: ["wdth"],
});

const description = "Génère une playlist de course qui suit ta courbe d'intensité idéale.";

export const metadata: Metadata = {
  title: "PaceBeat",
  description,
  icons: { icon: "/favicon.svg" },
  openGraph: { title: "PaceBeat", description, locale: "fr_FR", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#0a110c",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} ${inter.variable} ${martianMono.variable} h-full antialiased`}
    >
      <body className="lp-ground flex min-h-full flex-col font-body text-ink-high">
        <header className="lp-container flex items-center justify-between py-md">
          <Link href="/" className="font-display text-lg font-bold text-ink-high">
            PaceBeat
          </Link>
          {session?.accessToken && (
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button type="submit" className="font-body text-sm text-ink-medium underline">
                Se déconnecter
              </button>
            </form>
          )}
          {!session?.accessToken && <SignInForm compact />}
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
        <AttributionFooter />
      </body>
    </html>
  );
}
