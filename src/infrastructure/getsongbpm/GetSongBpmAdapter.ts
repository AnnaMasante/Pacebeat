import type { Track } from "@/domain/entities/Track";
import type { TempoLookupPort } from "@/application/ports/TempoLookupPort";
import { createConcurrencyLimiter } from "./concurrencyLimiter";
import { getCachedBpm, setCachedBpm } from "./inMemoryBpmCache";

const GETSONGBPM_BASE_URL = "https://api.getsongbpm.com";
const MAX_CONCURRENT_LOOKUPS = 5;

interface GetSongBpmSearchResult {
  tempo: string;
}

interface GetSongBpmSearchResponse {
  search?: GetSongBpmSearchResult[];
}

export class GetSongBpmAdapter implements TempoLookupPort {
  private readonly limit = createConcurrencyLimiter(MAX_CONCURRENT_LOOKUPS);

  constructor(private readonly apiKey: string) {}

  enrichWithBpm(tracks: Track[]): Promise<Track[]> {
    return Promise.all(tracks.map((track) => this.limit(() => this.enrichOne(track))));
  }

  private async enrichOne(track: Track): Promise<Track> {
    const cached = getCachedBpm(track.artist, track.title);
    if (cached !== undefined) {
      return { ...track, bpm: cached };
    }

    const bpm = await this.lookupBpm(track).catch(() => null);
    setCachedBpm(track.artist, track.title, bpm);
    return { ...track, bpm };
  }

  // GetSongBPM's official docs (api.getsongbpm.com/api) returned 403 during research; this
  // request/response shape is inferred from third-party references and needs verifying
  // against a real API key before relying on it in production.
  private async lookupBpm(track: Track): Promise<number | null> {
    const lookup = `song:${track.title} artist:${track.artist}`;
    const url = `${GETSONGBPM_BASE_URL}/search/?api_key=${encodeURIComponent(this.apiKey)}&type=song&lookup=${encodeURIComponent(lookup)}&limit=1`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = (await response.json()) as GetSongBpmSearchResponse;
    const tempo = data.search?.[0]?.tempo;
    if (!tempo) return null;

    const bpm = Number.parseFloat(tempo);
    return Number.isFinite(bpm) ? bpm : null;
  }
}
