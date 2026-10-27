"use client";

import { useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import type { GeneratedPlaylist } from "@/domain/entities/GeneratedPlaylist";

interface ManualCreatePanelProps {
  playlistName: string;
  playlist: GeneratedPlaylist;
  onCreateAnother: () => void;
}

export function ManualCreatePanel({
  playlistName,
  playlist,
  onCreateAnother,
}: ManualCreatePanelProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const lines = playlist.tracks.map(
      (track, index) => `${index + 1}. ${track.title} — ${track.artist}`,
    );
    await navigator.clipboard.writeText([playlistName, "", ...lines].join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="lp-panel">
      <div>
        <h1 className="text-2xl text-ink-high">{playlistName}</h1>
        <p className="mt-md text-sm text-ink-medium">
          Crée une playlist sur Spotify avec ce nom, puis ajoute ces titres dans l&apos;ordre
          (clique sur un titre pour l&apos;ouvrir dans Spotify).
        </p>
      </div>
      <ol className="lp-tracks lp-scroll">
        {playlist.tracks.map((track, index) => (
          <li
            key={track.spotifyId}
            className="border-b border-solid py-sm"
            style={{ borderColor: "var(--color-rule)" }}
          >
            <a
              href={`https://open.spotify.com/track/${track.spotifyId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="lp-link text-sm"
            >
              {index + 1}. {track.title}, {track.artist}
            </a>
          </li>
        ))}
      </ol>
      <Button onClick={handleCopy}>{copied ? "Copié" : "Copier la liste"}</Button>
      <Button variant="ghost" onClick={onCreateAnother}>
        Créer une autre playlist
      </Button>
    </Card>
  );
}
