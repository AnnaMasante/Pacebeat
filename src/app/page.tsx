import { auth, signIn, signOut } from "@/infrastructure/auth/authOptions";
import { Wizard } from "@/app/components/wizard/Wizard";
import { Button } from "@/app/components/ui/Button";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-xl px-md py-xl">
      {session?.accessToken ? (
        <div className="flex w-full flex-1 flex-col items-center gap-md">
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
            className="self-end"
          >
            <button type="submit" className="font-body text-sm text-ink-medium underline">
              Se déconnecter
            </button>
          </form>
          <Wizard />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-lg text-center">
          <div>
            <h1 className="font-display text-4xl font-bold text-ink-high">PaceBeat</h1>
            <p className="mt-sm max-w-[24rem] font-body text-ink-medium">
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
            <Button type="submit">Se connecter avec Spotify</Button>
          </form>
        </div>
      )}
    </main>
  );
}
