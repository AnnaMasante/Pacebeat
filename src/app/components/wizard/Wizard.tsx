"use client";

import { useState } from "react";
import type { RaceConfig } from "@/domain/entities/RaceConfig";
import type { GeneratedPlaylist } from "@/domain/entities/GeneratedPlaylist";
import type { StreamEvent } from "@/app/api/generate/route";
import { ConfigureForm } from "./ConfigureForm";
import { PreviewPanel } from "./PreviewPanel";
import { ManualCreatePanel } from "./ManualCreatePanel";
import { Card } from "@/app/components/ui/Card";
import { LatticeLoader } from "@/app/components/ui/LatticeLoader";
import { Toast } from "@/app/components/ui/Toast";

type WizardStep =
  | { name: "configure" }
  | { name: "generating"; stage: "fetching-tracks" }
  | { name: "generating"; stage: "enriching-bpm"; done: number; total: number }
  | { name: "preview"; playlist: GeneratedPlaylist; config: RaceConfig }
  | { name: "manual"; playlist: GeneratedPlaylist; playlistName: string }
  | { name: "error"; message: string };

export function Wizard() {
  const [step, setStep] = useState<WizardStep>({ name: "configure" });

  async function handleGenerate(config: RaceConfig) {
    setStep({ name: "generating", stage: "fetching-tracks" });
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!response.ok || !response.body) {
        throw new Error("La génération a échoué.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let playlist: GeneratedPlaylist | null = null;
      let streamError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as StreamEvent;
          if (event.type === "progress" && event.stage === "enriching-bpm") {
            setStep({
              name: "generating",
              stage: "enriching-bpm",
              done: event.done,
              total: event.total,
            });
          } else if (event.type === "progress") {
            setStep({ name: "generating", stage: "fetching-tracks" });
          } else if (event.type === "result") {
            playlist = event.playlist;
          } else if (event.type === "error") {
            streamError = event.message;
          }
        }
      }

      if (streamError || !playlist) {
        setStep({
          name: "error",
          message: streamError ?? "La génération a échoué. Réessaie dans un instant.",
        });
        return;
      }
      setStep({ name: "preview", playlist, config });
    } catch {
      setStep({ name: "error", message: "La génération a échoué. Réessaie dans un instant." });
    }
  }

  function handleConfirm(playlist: GeneratedPlaylist, config: RaceConfig) {
    // Spotify's Development Mode app write access (create playlist) is blocked for
    // non-allowlisted users as of the Feb/Mar 2026 developer access changes, so the
    // playlist is built manually by the user instead of via the write API.
    setStep({ name: "manual", playlist, playlistName: buildPlaylistName(config) });
  }

  switch (step.name) {
    case "configure":
      return <ConfigureForm onSubmit={handleGenerate} isSubmitting={false} />;
    case "generating":
      return (
        <Card className="flex w-full max-w-[28rem] flex-col items-center gap-md rounded-hero p-lg">
          <LatticeLoader
            label={
              step.stage === "fetching-tracks"
                ? "Récupération des morceaux"
                : `Analyse du tempo (${step.done}/${step.total})`
            }
            pattern="orbit"
            color="var(--color-primary)"
            glow
            glowColor="var(--color-primary)"
          />
        </Card>
      );
    case "preview":
      return (
        <PreviewPanel
          playlist={step.playlist}
          onBack={() => setStep({ name: "configure" })}
          onConfirm={() => handleConfirm(step.playlist, step.config)}
        />
      );
    case "manual":
      return (
        <ManualCreatePanel
          playlistName={step.playlistName}
          playlist={step.playlist}
          onCreateAnother={() => setStep({ name: "configure" })}
        />
      );
    case "error":
      return (
        <div className="flex flex-col items-center gap-md">
          <Toast variant="error">{step.message}</Toast>
          <button
            type="button"
            onClick={() => setStep({ name: "configure" })}
            className="font-body text-sm text-ink-medium underline"
          >
            Recommencer
          </button>
        </div>
      );
  }
}

function buildPlaylistName(config: RaceConfig): string {
  const shapeLabel =
    config.curveShape === "increasing"
      ? "Progressive"
      : config.curveShape === "decreasing"
        ? "Dégressive"
        : "Stable";
  return `PaceBeat · ${shapeLabel} · ${config.targetDurationMinutes} min`;
}
