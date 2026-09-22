import { auth, signIn } from "@/infrastructure/auth/authOptions";
import { Wizard } from "@/app/components/wizard/Wizard";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { SpotifyIcon } from "@/app/components/ui/icons/SpotifyIcon";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-xl px-md py-xl">
      {session?.accessToken ? (
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-md">
          <Wizard />
        </div>
      ) : (
        <Card className="flex flex-col items-center gap-lg text-center shadow-glow-intense">
          <div>
            <p className="max-w-96 font-display text-3xl font-semibold text-ink-high">
              Ta prochaine sortie, en rythme.
            </p>
            <p className="mt-sm max-w-96 font-body text-ink-medium">
              Génère une playlist de course qui suit exactement l&apos;intensité que tu veux, du
              départ à l&apos;arrivée.
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signIn("spotify");
            }}
          >
            <Button type="submit">
              <SpotifyIcon className="size-5" />
              Se connecter avec Spotify
            </Button>
          </form>
          <p className="font-body text-sm text-ink-low">Gratuit - Aucune carte requise</p>
        </Card>
      )}
    </main>
  );
}
