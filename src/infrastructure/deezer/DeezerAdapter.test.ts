import { afterEach, describe, expect, it, vi } from "vitest";
import type { Track } from "@/domain/entities/Track";
import { DeezerAdapter } from "./DeezerAdapter";

function makeTrack(
  overrides: Partial<Track> & { spotifyId: string; title: string; artist: string },
): Track {
  return {
    uri: `spotify:track:${overrides.spotifyId}`,
    durationMs: 3 * 60_000,
    isrc: null,
    bpm: null,
    ...overrides,
  };
}

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: () => Promise.resolve(body),
  } as Response;
}

describe("DeezerAdapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("enriches a track with the BPM returned by Deezer's ISRC lookup", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ bpm: 128 }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new DeezerAdapter();
    const track = makeTrack({
      spotifyId: "s1",
      title: "Levels",
      artist: "Avicii",
      isrc: "GBUM71029601",
    });

    const [result] = await adapter.enrichWithBpm([track]);

    expect(result.bpm).toBe(128);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestedUrl = fetchMock.mock.calls[0][0] as string;
    expect(requestedUrl).toBe("https://api.deezer.com/track/isrc:GBUM71029601");
  });

  it("halves an implausibly high bpm (octave detection error)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ bpm: 206.72 }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new DeezerAdapter();
    const track = makeTrack({
      spotifyId: "octave-high",
      title: "Could You Be Loved",
      artist: "Bob Marley & The Wailers",
      isrc: "GBUM71029608",
    });

    const [result] = await adapter.enrichWithBpm([track]);

    expect(result.bpm).toBeCloseTo(103.36);
  });

  it("doubles an implausibly low bpm (octave detection error)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ bpm: 30 }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new DeezerAdapter();
    const track = makeTrack({
      spotifyId: "octave-low",
      title: "Slow Detection Track",
      artist: "Some Artist",
      isrc: "GBUM71029609",
    });

    const [result] = await adapter.enrichWithBpm([track]);

    expect(result.bpm).toBe(60);
  });

  it("resolves bpm to null when Deezer reports bpm: 0 (unknown tempo)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ bpm: 0 }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new DeezerAdapter();
    const track = makeTrack({
      spotifyId: "s2",
      title: "Unknown Tempo Track",
      artist: "Some Artist",
      isrc: "GBUM71029602",
    });

    const [result] = await adapter.enrichWithBpm([track]);

    expect(result.bpm).toBeNull();
  });

  it("resolves bpm to null when Deezer returns an error body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ error: { message: "no data" } }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new DeezerAdapter();
    const track = makeTrack({
      spotifyId: "s3",
      title: "Not Found Track",
      artist: "Some Artist",
      isrc: "GBUM71029603",
    });

    const [result] = await adapter.enrichWithBpm([track]);

    expect(result.bpm).toBeNull();
  });

  it("resolves bpm to null when the response is not ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, false));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new DeezerAdapter();
    const track = makeTrack({
      spotifyId: "s4",
      title: "Rate Limited Track",
      artist: "Some Artist",
      isrc: "GBUM71029604",
    });

    const [result] = await adapter.enrichWithBpm([track]);

    expect(result.bpm).toBeNull();
  });

  it("resolves bpm to null when fetch rejects", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network error"));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new DeezerAdapter();
    const track = makeTrack({
      spotifyId: "s5",
      title: "Offline Track",
      artist: "Some Artist",
      isrc: "GBUM71029605",
    });

    const [result] = await adapter.enrichWithBpm([track]);

    expect(result.bpm).toBeNull();
  });

  it("resolves bpm to null without any network call when the track has no ISRC", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new DeezerAdapter();
    const track = makeTrack({
      spotifyId: "s6",
      title: "No ISRC Track",
      artist: "Some Artist",
      isrc: null,
    });

    const [result] = await adapter.enrichWithBpm([track]);

    expect(result.bpm).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("caches lookups so the same ISRC is only fetched once", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ bpm: 140 }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new DeezerAdapter();
    const trackA = makeTrack({
      spotifyId: "s7a",
      title: "Cached Track",
      artist: "Cache Artist",
      isrc: "GBUM71029607",
    });
    const trackB = makeTrack({
      spotifyId: "s7b",
      title: "Cached Track",
      artist: "Cache Artist",
      isrc: "GBUM71029607",
    });

    const [resultA] = await adapter.enrichWithBpm([trackA]);
    const [resultB] = await adapter.enrichWithBpm([trackB]);

    expect(resultA.bpm).toBe(140);
    expect(resultB.bpm).toBe(140);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports progress after each track resolves", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ bpm: 120 }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new DeezerAdapter();
    const tracks = [
      makeTrack({ spotifyId: "p1", title: "A", artist: "X", isrc: "ISRC1" }),
      makeTrack({ spotifyId: "p2", title: "B", artist: "X", isrc: "ISRC2" }),
    ];
    const onProgress = vi.fn();

    await adapter.enrichWithBpm(tracks, onProgress);

    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenCalledWith(1, 2);
    expect(onProgress).toHaveBeenCalledWith(2, 2);
  });

  it("waits out the rest of the 5s window before starting a second batch", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ bpm: 120 }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new DeezerAdapter();
    const tracks = Array.from({ length: 51 }, (_, i) =>
      makeTrack({ spotifyId: `t${i}`, title: `Track ${i}`, artist: "X", isrc: `BATCH-ISRC-${i}` }),
    );

    const enrichPromise = adapter.enrichWithBpm(tracks);

    // The first batch of 50 fires its fetches synchronously (before the first await settles).
    expect(fetchMock).toHaveBeenCalledTimes(50);

    // Before the 5s window elapses, the 51st track must not have been fetched yet.
    await vi.advanceTimersByTimeAsync(4_000);
    expect(fetchMock).toHaveBeenCalledTimes(50);

    // Once the window elapses, the last batch fires.
    await vi.advanceTimersByTimeAsync(2_000);
    expect(fetchMock).toHaveBeenCalledTimes(51);

    await enrichPromise;
    vi.useRealTimers();
  });
});
