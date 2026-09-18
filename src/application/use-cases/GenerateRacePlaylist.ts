import type { RaceConfig } from "@/domain/entities/RaceConfig";
import type { GeneratedPlaylist } from "@/domain/entities/GeneratedPlaylist";
import { buildCurvePlaylist, type TempoTrack } from "@/domain/services/PlaylistCurveBuilder";
import type { MusicSourcePort } from "../ports/MusicSourcePort";
import type { TempoLookupPort } from "../ports/TempoLookupPort";

export class GenerateRacePlaylist {
  constructor(
    private readonly musicSource: MusicSourcePort,
    private readonly tempoLookup: TempoLookupPort,
  ) {}

  async execute(config: RaceConfig): Promise<GeneratedPlaylist> {
    const rawTracks =
      config.source.type === "liked"
        ? await this.musicSource.getLikedSongs()
        : await this.musicSource.getPlaylistTracks(config.source.playlistId);

    const enrichedTracks = await this.tempoLookup.enrichWithBpm(rawTracks);
    const pool: TempoTrack[] = enrichedTracks.filter(
      (track): track is TempoTrack => track.bpm !== null,
    );

    const result = buildCurvePlaylist(pool, {
      targetDurationMinutes: config.targetDurationMinutes,
      curveShape: config.curveShape,
    });

    return {
      ...result,
      excludedTrackCount: rawTracks.length - pool.length,
    };
  }
}
