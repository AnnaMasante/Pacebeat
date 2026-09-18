import type { Track } from "@/domain/entities/Track";

export interface TempoLookupPort {
  /** Returns the same tracks with `bpm` filled in where a match was found, `null` otherwise. */
  enrichWithBpm(tracks: Track[]): Promise<Track[]>;
}
