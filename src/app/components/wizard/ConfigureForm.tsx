"use client";

import { useState } from "react";
import type { RaceConfig, TrackSource } from "@/domain/entities/RaceConfig";
import type { CurveShape } from "@/domain/value-objects/CurveShape";
import { Slider } from "@/app/components/ui/Slider";
import { BeatCurve } from "@/app/components/landing/BeatCurve";
import { CurveShapePicker } from "@/app/components/wizard/CurveShapePicker";
import { PlaylistSourceSelect } from "@/app/components/wizard/PlaylistSourceSelect";
import { Button } from "@/app/components/ui/Button";

interface ConfigureFormProps {
  onSubmit: (config: RaceConfig) => void;
  isSubmitting: boolean;
}

export function ConfigureForm({ onSubmit, isSubmitting }: ConfigureFormProps) {
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(35);
  const [curveShape, setCurveShape] = useState<CurveShape>("increasing");
  const [source, setSource] = useState<TrackSource>({ type: "liked" });

  return (
    <div className="lp-config">
      <div className="lp-well lp-config__form">
        <div className="flex flex-col gap-sm">
          <h1 className="text-2xl text-ink-high">Configure ta course</h1>
          <p className="text-sm text-ink-medium">
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

        <div className="flex flex-col gap-sm">
          <span className="lp-label">Forme de la courbe d&apos;intensité</span>
          <CurveShapePicker value={curveShape} onChange={setCurveShape} />
        </div>

        <PlaylistSourceSelect value={source} onChange={setSource} />

        <Button
          onClick={() => onSubmit({ targetDurationMinutes, curveShape, source })}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Génération..." : "Générer ma playlist"}
        </Button>
      </div>

      <div className="lp-well lp-stage" aria-hidden="true">
        <BeatCurve shape={curveShape} count={40} />
        <p className="lp-stage__axis">
          <span>départ</span>
          <span>{targetDurationMinutes} min</span>
          <span>arrivée</span>
        </p>
      </div>
    </div>
  );
}
