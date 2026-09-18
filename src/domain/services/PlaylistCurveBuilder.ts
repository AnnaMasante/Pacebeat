import type { Track } from "../entities/Track";
import type { CurveShape } from "../value-objects/CurveShape";
import type { BpmProgressionPoint } from "../value-objects/BpmProgressionPoint";
import { percentile } from "./percentile";

export type TempoTrack = Omit<Track, "bpm"> & { bpm: number };

export interface CurvePlaylistResult {
  tracks: TempoTrack[];
  progression: BpmProgressionPoint[];
  requestedDurationMs: number;
  achievedDurationMs: number;
  wasDurationAdjusted: boolean;
  narrowRangeWarning: boolean;
}

export interface CurvePlaylistParams {
  targetDurationMinutes: number;
  curveShape: CurveShape;
}

const NARROW_RANGE_THRESHOLD_BPM = 15;

/**
 * Pure, deterministic playlist-ordering algorithm. `pool` may contain duplicates or an
 * insufficient total duration for the request — both are handled here rather than assumed
 * away by the caller, since "never repeat a track" is a hard product requirement.
 */
export function buildCurvePlaylist(
  pool: TempoTrack[],
  params: CurvePlaylistParams,
): CurvePlaylistResult {
  const requestedDurationMs = params.targetDurationMinutes * 60_000;
  const dedupedPool = dedupeByTrackId(pool);

  if (dedupedPool.length === 0) {
    return {
      tracks: [],
      progression: [],
      requestedDurationMs,
      achievedDurationMs: 0,
      wasDurationAdjusted: requestedDurationMs > 0,
      narrowRangeWarning: false,
    };
  }

  const sortedBpms = dedupedPool.map((track) => track.bpm).sort((a, b) => a - b);
  const lowBpm = percentile(sortedBpms, 10);
  const midBpm = percentile(sortedBpms, 50);
  const highBpm = percentile(sortedBpms, 90);
  const narrowRangeWarning = highBpm - lowBpm < NARROW_RANGE_THRESHOLD_BPM;

  const poolTotalDurationMs = dedupedPool.reduce((sum, track) => sum + track.durationMs, 0);
  const achievableDurationMs = Math.min(requestedDurationMs, poolTotalDurationMs);
  const wasDurationAdjusted = achievableDurationMs < requestedDurationMs;

  const targetBpmAt = (elapsedMs: number): number => {
    const progress = achievableDurationMs === 0 ? 0 : Math.min(elapsedMs / achievableDurationMs, 1);
    if (params.curveShape === "increasing") return lowBpm + progress * (highBpm - lowBpm);
    if (params.curveShape === "decreasing") return highBpm - progress * (highBpm - lowBpm);
    return midBpm;
  };

  const remaining = [...dedupedPool];
  const tracks: TempoTrack[] = [];
  const progression: BpmProgressionPoint[] = [];
  let elapsedMs = 0;

  while (remaining.length > 0 && elapsedMs < achievableDurationMs) {
    const target = targetBpmAt(elapsedMs);
    const bestIndex = pickBestTrackIndex(remaining, target, elapsedMs, achievableDurationMs);
    const [track] = remaining.splice(bestIndex, 1);

    progression.push({
      elapsedMs,
      targetBpm: target,
      actualBpm: track.bpm,
      trackIndex: tracks.length,
    });
    tracks.push(track);
    elapsedMs += track.durationMs;
  }

  return {
    tracks,
    progression,
    requestedDurationMs,
    achievedDurationMs: elapsedMs,
    wasDurationAdjusted,
    narrowRangeWarning,
  };
}

function pickBestTrackIndex(
  candidates: TempoTrack[],
  targetBpm: number,
  elapsedMs: number,
  achievableDurationMs: number,
): number {
  let bestIndex = 0;
  let bestBpmDiff = Infinity;
  let bestFinishDistance = Infinity;

  candidates.forEach((track, index) => {
    const bpmDiff = Math.abs(track.bpm - targetBpm);
    const finishDistance = Math.abs(elapsedMs + track.durationMs - achievableDurationMs);

    const isBetterMatch = bpmDiff < bestBpmDiff;
    const isTieBrokenByFit = bpmDiff === bestBpmDiff && finishDistance < bestFinishDistance;

    if (isBetterMatch || isTieBrokenByFit) {
      bestIndex = index;
      bestBpmDiff = bpmDiff;
      bestFinishDistance = finishDistance;
    }
  });

  return bestIndex;
}

function dedupeByTrackId(pool: TempoTrack[]): TempoTrack[] {
  const seen = new Set<string>();
  const result: TempoTrack[] = [];
  for (const track of pool) {
    if (seen.has(track.spotifyId)) continue;
    seen.add(track.spotifyId);
    result.push(track);
  }
  return result;
}
