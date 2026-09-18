import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

interface SuccessPanelProps {
  externalUrl: string;
  onCreateAnother: () => void;
}

export function SuccessPanel({ externalUrl, onCreateAnother }: SuccessPanelProps) {
  return (
    <Card className="flex w-full max-w-[28rem] flex-col items-center gap-lg rounded-hero p-lg text-center">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-high">Playlist créée</h1>
        <p className="mt-xs font-body text-sm text-ink-medium">
          Elle est prête à écouter sur ton compte Spotify.
        </p>
      </div>
      <a href={externalUrl} target="_blank" rel="noopener noreferrer">
        <Button>Ouvrir sur Spotify</Button>
      </a>
      <Button variant="ghost" onClick={onCreateAnother}>
        Créer une autre playlist
      </Button>
    </Card>
  );
}
