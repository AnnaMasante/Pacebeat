const cache = new Map<string, number | null>();

export function getCachedBpm(isrc: string): number | null | undefined {
  return cache.get(isrc);
}

export function setCachedBpm(isrc: string, bpm: number | null): void {
  cache.set(isrc, bpm);
}
