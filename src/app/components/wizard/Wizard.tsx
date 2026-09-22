"use client";

import { useState } from "react";
import type { RaceConfig } from "@/domain/entities/RaceConfig";
import type { GeneratedPlaylist } from "@/domain/entities/GeneratedPlaylist";
import type { StreamEvent } from "@/app/api/generate/route";
import { confirmCreatePlaylist } from "@/app/actions/confirmCreate";
import { ConfigureForm } from "./ConfigureForm";
import { PreviewPanel } from "./PreviewPanel";
import { SuccessPanel } from "./SuccessPanel";
import { Spinner } from "@/app/components/ui/Spinner";
import { ProgressBar } from "@/app/components/ui/ProgressBar";
import { Toast } from "@/app/components/ui/Toast";

type WizardStep =
  | { name: "configure" }
  | { name: "generating"; stage: "fetching-tracks" }
  | { name: "generating"; stage: "enriching-bpm"; done: number; total: number }
  | { name: "preview"; playlist: GeneratedPlaylist; config: RaceConfig }
  | { name: "creating"; playlist: GeneratedPlaylist; config: RaceConfig }
  | { name: "success"; externalUrl: string }
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

  async function handleConfirm(playlist: GeneratedPlaylist, config: RaceConfig) {
    setStep({ name: "creating", playlist, config });
    try {
      const result = await confirmCreatePlaylist({
        name: buildPlaylistName(config),
        description: "Générée par PaceBeat",
        trackUris: playlist.tracks.map((track) => track.uri),
      });
      setStep({ name: "success", externalUrl: result.externalUrl });
    } catch {
      setStep({
        name: "error",
        message: "La création sur Spotify a échoué. Réessaie dans un instant.",
      });
    }
  }

  switch (step.name) {
    case "configure":
      return <ConfigureForm onSubmit={handleGenerate} isSubmitting={false} />;
    case "generating":
      return step.stage === "fetching-tracks" ? (
        <Spinner label="Récupération des morceaux..." />
      ) : (
        <ProgressBar label="Analyse du tempo..." done={step.done} total={step.total} />
      );
    case "preview":
      return (
        <PreviewPanel
          playlist={step.playlist}
          isConfirming={false}
          onBack={() => setStep({ name: "configure" })}
          onConfirm={() => handleConfirm(step.playlist, step.config)}
        />
      );
    case "creating":
      return <Spinner label="Création sur Spotify..." />;
    case "success":
      return (
        <SuccessPanel
          externalUrl={step.externalUrl}
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
