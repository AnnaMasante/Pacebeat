import { describe, expect, it } from "vitest";
import { buildCurvePlaylist, type TempoTrack } from "./PlaylistCurveBuilder";

function makeTrack(
  overrides: Partial<TempoTrack> & { spotifyId: string; bpm: number },
): TempoTrack {
  return {
    uri: `spotify:track:${overrides.spotifyId}`,
    title: overrides.spotifyId,
    artist: "Test Artist",
    durationMs: 3 * 60_000,
    ...overrides,
  };
}

function averageBpm(tracks: TempoTrack[]): number {
  return tracks.reduce((sum, track) => sum + track.bpm, 0) / tracks.length;
}

describe("buildCurvePlaylist", () => {
  const evenlySpreadPool: TempoTrack[] = Array.from({ length: 12 }, (_, index) =>
    makeTrack({ spotifyId: `t${index}`, bpm: 100 + index * 10 }),
  );

  it("orders tracks so BPM trends upward for an increasing curve", () => {
    const result = buildCurvePlaylist(evenlySpreadPool, {
      targetDurationMinutes: 36,
      curveShape: "increasing",
    });

    const firstThird = result.tracks.slice(0, 4);
    const lastThird = result.tracks.slice(-4);
    expect(averageBpm(lastThird)).toBeGreaterThan(averageBpm(firstThird));
  });

  it("orders tracks so BPM trends downward for a decreasing curve", () => {
    const result = buildCurvePlaylist(evenlySpreadPool, {
      targetDurationMinutes: 36,
      curveShape: "decreasing",
    });

    const firstThird = result.tracks.slice(0, 4);
    const lastThird = result.tracks.slice(-4);
    expect(averageBpm(firstThird)).toBeGreaterThan(averageBpm(lastThird));
  });

  it("keeps BPM close to the pool median for a stable curve", () => {
    const result = buildCurvePlaylist(evenlySpreadPool, {
      targetDurationMinutes: 36,
      curveShape: "stable",
    });

    const median = 155; // p50 of 100..210 step 10
    for (const track of result.tracks) {
      expect(Math.abs(track.bpm - median)).toBeLessThanOrEqual(60);
    }
  });

  it("never repeats a track and caps duration when the pool is insufficient", () => {
    const smallPool: TempoTrack[] = [
      makeTrack({ spotifyId: "a", bpm: 120, durationMs: 2 * 60_000 }),
      makeTrack({ spotifyId: "b", bpm: 130, durationMs: 2 * 60_000 }),
      makeTrack({ spotifyId: "c", bpm: 140, durationMs: 2 * 60_000 }),
    ];

    const result = buildCurvePlaylist(smallPool, {
      targetDurationMinutes: 60,
      curveShape: "increasing",
    });

    const uniqueIds = new Set(result.tracks.map((track) => track.spotifyId));
    expect(uniqueIds.size).toBe(result.tracks.length);
    expect(result.wasDurationAdjusted).toBe(true);
    expect(result.achievedDurationMs).toBeLessThanOrEqual(6 * 60_000);
    expect(result.tracks.length).toBe(3);
  });

  it("returns a graceful empty result for an empty pool", () => {
    const result = buildCurvePlaylist([], { targetDurationMinutes: 35, curveShape: "increasing" });

    expect(result.tracks).toEqual([]);
    expect(result.progression).toEqual([]);
    expect(result.achievedDurationMs).toBe(0);
  });

  it("flags a narrow row range warning when the pool's tempos are close together", () => {
    const narrowPool: TempoTrack[] = Array.from({ length: 8 }, (_, index) =>
      makeTrack({ spotifyId: `n${index}`, bpm: 118 + index }),
    );

    const result = buildCurvePlaylist(narrowPool, {
      targetDurationMinutes: 24,
      curveShape: "increasing",
    });

    expect(result.narrowRangeWarning).toBe(true);
  });

  it("deduplicates tracks that appear more than once in the source pool", () => {
    const duplicated: TempoTrack[] = [
      makeTrack({ spotifyId: "x", bpm: 120 }),
      makeTrack({ spotifyId: "x", bpm: 120 }),
      makeTrack({ spotifyId: "y", bpm: 140 }),
    ];

    const result = buildCurvePlaylist(duplicated, {
      targetDurationMinutes: 30,
      curveShape: "stable",
    });

    const uniqueIds = new Set(result.tracks.map((track) => track.spotifyId));
    expect(uniqueIds.size).toBe(result.tracks.length);
  });
});
