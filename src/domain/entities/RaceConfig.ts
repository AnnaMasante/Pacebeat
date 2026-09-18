import type { CurveShape } from "../value-objects/CurveShape";

export type TrackSource = { type: "playlist"; playlistId: string } | { type: "liked" };

export interface RaceConfig {
  targetDurationMinutes: number;
  curveShape: CurveShape;
  source: TrackSource;
}
