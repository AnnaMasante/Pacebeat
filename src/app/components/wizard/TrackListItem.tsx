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
    <li className="lp-track">
      <span className="lp-label text-center">{position}</span>
      <div className="min-w-0">
        <p className="truncate text-sm text-ink-high">{track.title}</p>
        <p className="lp-label truncate">{track.artist}</p>
      </div>
      <span className="lp-track__bpm text-sm">{track.bpm ?? "–"} BPM</span>
      <span className="lp-label text-right">{formatDuration(track.durationMs)}</span>
    </li>
  );
}
