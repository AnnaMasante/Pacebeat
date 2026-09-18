import type { Track } from "@/domain/entities/Track";
import type { MusicSourcePort, PlaylistSummary } from "@/application/ports/MusicSourcePort";
import { fetchAllPages } from "./spotifyApiClient";

interface SpotifyArtist {
  name: string;
}

interface SpotifyTrackObject {
  id: string | null;
  uri: string;
  name: string;
  duration_ms: number;
  artists: SpotifyArtist[];
  is_local: boolean;
}

interface SpotifyPlaylistTrackItem {
  track: SpotifyTrackObject | null;
}

interface SpotifySavedTrackItem {
  track: SpotifyTrackObject | null;
}

interface SpotifyPlaylistObject {
  id: string;
  name: string;
  items?: { total: number };
}

export class SpotifyMusicSourceAdapter implements MusicSourcePort {
  constructor(private readonly accessToken: string) {}

  async listUserPlaylists(): Promise<PlaylistSummary[]> {
    const playlists = await fetchAllPages<SpotifyPlaylistObject>(
      this.accessToken,
      "/me/playlists?limit=50",
    );
    return playlists.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      trackCount: playlist.items?.total ?? 0,
    }));
  }

  async getPlaylistTracks(playlistId: string): Promise<Track[]> {
    const items = await fetchAllPages<SpotifyPlaylistTrackItem>(
      this.accessToken,
      `/playlists/${playlistId}/tracks?limit=100`,
    );
    return items
      .map((item) => item.track)
      .filter(isUsableTrack)
      .map(toDomainTrack);
  }

  async getLikedSongs(): Promise<Track[]> {
    const items = await fetchAllPages<SpotifySavedTrackItem>(
      this.accessToken,
      "/me/tracks?limit=50",
    );
    return items
      .map((item) => item.track)
      .filter(isUsableTrack)
      .map(toDomainTrack);
  }
}

function isUsableTrack(track: SpotifyTrackObject | null): track is SpotifyTrackObject {
  return track !== null && !track.is_local && track.id !== null;
}

function toDomainTrack(track: SpotifyTrackObject): Track {
  return {
    spotifyId: track.id as string,
    uri: track.uri,
    title: track.name,
    artist: track.artists[0]?.name ?? "Unknown artist",
    durationMs: track.duration_ms,
    bpm: null,
  };
}
