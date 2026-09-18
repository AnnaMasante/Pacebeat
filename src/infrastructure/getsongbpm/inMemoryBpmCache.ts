const cache = new Map<string, number | null>();

function normalizeKey(artist: string, title: string): string {
  return `${artist.trim().toLowerCase()}::${title.trim().toLowerCase()}`;
}

export function getCachedBpm(artist: string, title: string): number | null | undefined {
  return cache.get(normalizeKey(artist, title));
}

export function setCachedBpm(artist: string, title: string, bpm: number | null): void {
  cache.set(normalizeKey(artist, title), bpm);
}
