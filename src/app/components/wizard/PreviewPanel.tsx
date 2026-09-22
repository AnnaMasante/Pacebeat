import type { GeneratedPlaylist } from "@/domain/entities/GeneratedPlaylist";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { TrackList } from "@/app/components/wizard/TrackList";
import { BpmProgressionChart } from "@/app/components/wizard/BpmProgressionChart";
import { AdjustedDurationNotice } from "@/app/components/wizard/AdjustedDurationNotice";

interface PreviewPanelProps {
  playlist: GeneratedPlaylist;
  onConfirm: () => void;
  onBack: () => void;
}

export function PreviewPanel({ playlist, onConfirm, onBack }: PreviewPanelProps) {
  return (
    <Card className="flex w-full max-w-[36rem] flex-col gap-lg rounded-hero p-lg">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-high">Ta playlist est prête</h1>
        <p className="mt-xs font-body text-sm tabular-nums text-ink-medium">
          {playlist.tracks.length} morceaux · {Math.round(playlist.achievedDurationMs / 60_000)} min
        </p>
      </div>

      <AdjustedDurationNotice
        wasDurationAdjusted={playlist.wasDurationAdjusted}
        achievedDurationMs={playlist.achievedDurationMs}
        narrowRangeWarning={playlist.narrowRangeWarning}
        excludedTrackCount={playlist.excludedTrackCount}
      />

      {playlist.tracks.length > 0 ? (
        <>
          <BpmProgressionChart progression={playlist.progression} tracks={playlist.tracks} />
          <div className="max-h-80 overflow-y-auto">
            <TrackList tracks={playlist.tracks} />
          </div>
        </>
      ) : (
        <p className="font-body text-sm text-ink-medium">
          Pas assez de données de tempo pour construire une playlist à partir de cette source.
        </p>
      )}

      <div className="flex gap-sm">
        <Button variant="ghost" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={onConfirm} disabled={playlist.tracks.length === 0} className="flex-1">
          Obtenir la liste des titres
        </Button>
      </div>
    </Card>
  );
}
