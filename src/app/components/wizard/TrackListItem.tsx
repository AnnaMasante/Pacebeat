import type { Track } from "@/domain/entities/Track";

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface TrackListItemProps {
  track: Track;
  position: number;
}

export function TrackListItem({ track, position }: TrackListItemProps) {
  return (
    <li className="flex h-14 items-center gap-md rounded-micro px-sm hover:bg-card">
      <span className="w-6 text-center font-body text-sm tabular-nums text-ink-low">
        {position}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-sm font-medium text-ink-high">{track.title}</p>
        <p className="truncate font-body text-xs text-ink-medium">{track.artist}</p>
      </div>
      <span className="font-display text-sm font-semibold tabular-nums text-primary">
        {track.bpm ?? "–"} BPM
      </span>
      <span className="w-12 text-right font-body text-xs tabular-nums text-ink-low">
        {formatDuration(track.durationMs)}
      </span>
    </li>
  );
}
