export interface Track {
  spotifyId: string;
  uri: string;
  title: string;
  artist: string;
  durationMs: number;
  isrc: string | null;
  bpm: number | null;
}
