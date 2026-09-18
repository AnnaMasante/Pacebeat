"use client";

import { useState } from "react";
import type { RaceConfig, TrackSource } from "@/domain/entities/RaceConfig";
import type { CurveShape } from "@/domain/value-objects/CurveShape";
import { Slider } from "@/app/components/ui/Slider";
import { CurveShapePicker } from "@/app/components/wizard/CurveShapePicker";
import { PlaylistSourceSelect } from "@/app/components/wizard/PlaylistSourceSelect";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";

interface ConfigureFormProps {
  onSubmit: (config: RaceConfig) => void;
  isSubmitting: boolean;
}

export function ConfigureForm({ onSubmit, isSubmitting }: ConfigureFormProps) {
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(35);
  const [curveShape, setCurveShape] = useState<CurveShape>("increasing");
  const [source, setSource] = useState<TrackSource>({ type: "liked" });

  return (
    <Card className="flex w-full max-w-112 flex-col gap-lg rounded-hero p-lg">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-high">Configure ta course</h1>
        <p className="mt-xs font-body text-sm text-ink-medium">
          On construit ta playlist pour suivre l&apos;intensité que tu veux, du départ à
          l&apos;arrivée.
        </p>
      </div>

      <Slider
        id="duration"
        label="Durée cible"
        min={10}
        max={120}
        step={5}
        value={targetDurationMinutes}
        onChange={setTargetDurationMinutes}
        formatValue={(value) => `${value} min`}
      />

      <div className="flex flex-col gap-xs">
        <span className="font-body text-sm tracking-wide text-ink-medium">
          Forme de la courbe d&apos;intensité
        </span>
        <CurveShapePicker value={curveShape} onChange={setCurveShape} />
      </div>

      <PlaylistSourceSelect value={source} onChange={setSource} />

      <Button
        onClick={() => onSubmit({ targetDurationMinutes, curveShape, source })}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Génération..." : "Générer ma playlist"}
      </Button>
    </Card>
  );
}
