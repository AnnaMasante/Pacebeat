import type { Track } from "./Track";
import type { BpmProgressionPoint } from "../value-objects/BpmProgressionPoint";

export interface GeneratedPlaylist {
  tracks: Track[];
  progression: BpmProgressionPoint[];
  requestedDurationMs: number;
  achievedDurationMs: number;
  wasDurationAdjusted: boolean;
  narrowRangeWarning: boolean;
  excludedTrackCount: number;
}
