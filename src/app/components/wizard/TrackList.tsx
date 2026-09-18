import type { Track } from "@/domain/entities/Track";
import { TrackListItem } from "./TrackListItem";

export function TrackList({ tracks }: { tracks: Track[] }) {
  return (
    <ol className="flex flex-col gap-xs">
      {tracks.map((track, index) => (
        <TrackListItem key={track.spotifyId} track={track} position={index + 1} />
      ))}
    </ol>
  );
}
