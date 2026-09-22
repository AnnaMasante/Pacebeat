import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { AttributionFooter } from "@/app/components/layout/AttributionFooter";
import GhostFibers from "@/app/components/backgrounds/GhostFibers";
import { auth, signOut } from "@/infrastructure/auth/authOptions";

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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html lang="fr" className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-canvas font-body text-ink-high">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <GhostFibers
            lineColor="#0c2f18"
            glowColor="#136a32"
            speed={0.2}
            scale={2}
            rotation={0}
            rotationSpeed={0.25}
            layers={4}
            waveAmplitude={0.015}
            waveFrequency={3}
            waveSpeed={0.15}
            layerSpeed={0.08}
            twist={0.1}
            twistFrequency={5}
            twistSpeed={1.2}
            lineFrequency={5}
            lineSpacing={2}
            lineSharpness={16}
            glowFalloff={10}
            glowIntensity={1.6}
            brightness={2}
            blueBoost={1.25}
            vignette={0.8}
            grain={0.05}
            dpr={1}
            lightMode={false}
            fps={60}
            paused={false}
          />
        </div>
        <header className="flex items-center justify-between px-lg py-md">
          <a href="/" className="font-display text-lg font-bold text-ink-high">
            PaceBeat
          </a>
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
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
        <AttributionFooter />
      </body>
    </html>
  );
}
