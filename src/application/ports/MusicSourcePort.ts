import type { Track } from "@/domain/entities/Track";

export interface PlaylistSummary {
  id: string;
  name: string;
  trackCount: number;
}

export interface MusicSourcePort {
  listUserPlaylists(): Promise<PlaylistSummary[]>;
  getPlaylistTracks(playlistId: string): Promise<Track[]>;
  getLikedSongs(): Promise<Track[]>;
}
