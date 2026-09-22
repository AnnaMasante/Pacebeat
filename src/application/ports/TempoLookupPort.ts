import type { Track } from "@/domain/entities/Track";

export type TempoLookupProgress = (done: number, total: number) => void;

export interface TempoLookupPort {
  /** Returns the same tracks with `bpm` filled in where a match was found, `null` otherwise.
   *  `onProgress` (optional) is called after each track resolves, for UI feedback during
   *  long-running batches — implementations that can't report progress may ignore it. */
  enrichWithBpm(tracks: Track[], onProgress?: TempoLookupProgress): Promise<Track[]>;
}
