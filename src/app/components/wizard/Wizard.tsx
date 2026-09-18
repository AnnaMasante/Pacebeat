"use client";

import { useState } from "react";
import type { RaceConfig } from "@/domain/entities/RaceConfig";
import type { GeneratedPlaylist } from "@/domain/entities/GeneratedPlaylist";
import { generateRacePlaylist } from "@/app/actions/generate";
import { confirmCreatePlaylist } from "@/app/actions/confirmCreate";
import { ConfigureForm } from "./ConfigureForm";
import { PreviewPanel } from "./PreviewPanel";
import { SuccessPanel } from "./SuccessPanel";
import { Spinner } from "@/app/components/ui/Spinner";
import { Toast } from "@/app/components/ui/Toast";

type WizardStep =
  | { name: "configure" }
  | { name: "generating" }
  | { name: "preview"; playlist: GeneratedPlaylist; config: RaceConfig }
  | { name: "creating"; playlist: GeneratedPlaylist; config: RaceConfig }
  | { name: "success"; externalUrl: string }
  | { name: "error"; message: string };

export function Wizard() {
  const [step, setStep] = useState<WizardStep>({ name: "configure" });

  async function handleGenerate(config: RaceConfig) {
    setStep({ name: "generating" });
    try {
      const playlist = await generateRacePlaylist(config);
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
      return <Spinner label="On construit ta playlist..." />;
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
