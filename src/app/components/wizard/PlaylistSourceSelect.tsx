"use client";

import { useEffect, useState } from "react";
import type { PlaylistSummary } from "@/application/ports/MusicSourcePort";
import type { TrackSource } from "@/domain/entities/RaceConfig";
import { listPlaylistSources } from "@/app/actions/listSources";

interface PlaylistSourceSelectProps {
  value: TrackSource;
  onChange: (value: TrackSource) => void;
}

export function PlaylistSourceSelect({ value, onChange }: PlaylistSourceSelectProps) {
  const [playlists, setPlaylists] = useState<PlaylistSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPlaylistSources()
      .then((result) => {
        setPlaylists(result);
      })
      .catch((err: unknown) => {
        console.error("Failed to load Spotify playlists", err);
        setError("Impossible de charger tes playlists Spotify.");
      });
  }, []);

  const selectedValue = value.type === "liked" ? "liked" : value.playlistId;

  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor="source" className="lp-label">
        Source des morceaux
      </label>
      <div className="lp-select">
        <select
          id="source"
          value={selectedValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(
              nextValue === "liked"
                ? { type: "liked" }
                : { type: "playlist", playlistId: nextValue },
            );
          }}
          className="lp-field"
        >
          <option value="liked">Liked Songs</option>
          {playlists?.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.name} ({playlist.trackCount})
            </option>
          ))}
        </select>
      </div>
      {error ? <p className="text-sm text-ink-medium">{error}</p> : null}
    </div>
  );
}
