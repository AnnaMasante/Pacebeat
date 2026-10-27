import { signIn } from "@/infrastructure/auth/authOptions";
import { SpotifyIcon } from "@/app/components/ui/icons/SpotifyIcon";

export function SignInForm({ compact = false }: { compact?: boolean }) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("spotify");
      }}
    >
      <button type="submit" className={compact ? "lp-btn lp-btn--s" : "lp-btn"}>
        <SpotifyIcon className="size-5" />
        {compact ? "Se connecter" : "Se connecter avec Spotify"}
      </button>
    </form>
  );
}
