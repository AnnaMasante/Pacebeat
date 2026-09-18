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
      <label htmlFor="source" className="font-body text-sm tracking-wide text-ink-medium">
        Source des morceaux
      </label>
      <select
        id="source"
        value={selectedValue}
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(
            nextValue === "liked" ? { type: "liked" } : { type: "playlist", playlistId: nextValue },
          );
        }}
        className="rounded-card bg-hover px-md py-sm font-body text-ink-high focus:ring-1 focus:ring-primary focus:outline-none"
      >
        <option value="liked">Liked Songs</option>
        {playlists?.map((playlist) => (
          <option key={playlist.id} value={playlist.id}>
            {playlist.name} ({playlist.trackCount})
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-secondary">{error}</p> : null}
    </div>
  );
}
