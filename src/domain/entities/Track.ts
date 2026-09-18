export interface Track {
  spotifyId: string;
  uri: string;
  title: string;
  artist: string;
  durationMs: number;
  bpm: number | null;
}
