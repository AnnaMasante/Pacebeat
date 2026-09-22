import type { Track } from "@/domain/entities/Track";
import type { TempoLookupPort, TempoLookupProgress } from "@/application/ports/TempoLookupPort";
import { getCachedBpm, setCachedBpm } from "./bpmCache";

const DEEZER_BASE_URL = "https://api.deezer.com";
const BATCH_SIZE = 50;
const WINDOW_MS = 5_000;

interface DeezerTrackObject {
  bpm: number;
  error?: unknown;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Deezer's tempo detection frequently reports an "octave" error — half or double the
// real tempo — especially on syncopated genres like reggae or hip-hop. Fold the value
// back into a plausible tempo range instead of feeding the raw detector output into the
// BPM-percentile curve, where a single octave error skews the whole pace progression.
const MIN_PLAUSIBLE_BPM = 40;
const MAX_PLAUSIBLE_BPM = 190;

function normalizeBpm(bpm: number): number | null {
  if (bpm <= 0) return null;

  let corrected = bpm;
  while (corrected > MAX_PLAUSIBLE_BPM) corrected /= 2;
  while (corrected < MIN_PLAUSIBLE_BPM) corrected *= 2;

  return corrected;
}

export class DeezerAdapter implements TempoLookupPort {
  async enrichWithBpm(tracks: Track[], onProgress?: TempoLookupProgress): Promise<Track[]> {
    const total = tracks.length;
    let done = 0;
    const results: Track[] = [];

    for (let start = 0; start < tracks.length; start += BATCH_SIZE) {
      const batch = tracks.slice(start, start + BATCH_SIZE);
      const batchStartedAt = Date.now();

      const enrichedBatch = await Promise.all(
        batch.map(async (track) => {
          const enriched = await this.enrichOne(track);
          done += 1;
          onProgress?.(done, total);
          return enriched;
        }),
      );
      results.push(...enrichedBatch);

      const hasMoreBatches = start + BATCH_SIZE < tracks.length;
      if (hasMoreBatches) {
        const elapsed = Date.now() - batchStartedAt;
        await sleep(Math.max(0, WINDOW_MS - elapsed));
      }
    }

    return results;
  }

  private async enrichOne(track: Track): Promise<Track> {
    if (!track.isrc) {
      return { ...track, bpm: null };
    }

    const cached = getCachedBpm(track.isrc);
    if (cached !== undefined) {
      return { ...track, bpm: cached };
    }

    const bpm = await this.lookupBpm(track.isrc).catch(() => null);
    setCachedBpm(track.isrc, bpm);
    return { ...track, bpm };
  }

  private async lookupBpm(isrc: string): Promise<number | null> {
    const response = await fetch(`${DEEZER_BASE_URL}/track/isrc:${encodeURIComponent(isrc)}`);
    if (!response.ok) return null;

    const data = (await response.json()) as DeezerTrackObject;
    if (data.error) return null;

    return normalizeBpm(data.bpm);
  }
}
