import { afterEach, describe, expect, it, vi } from "vitest";
import type { Track } from "@/domain/entities/Track";
import { GetSongBpmAdapter } from "./GetSongBpmAdapter";

function makeTrack(
  overrides: Partial<Track> & { spotifyId: string; title: string; artist: string },
): Track {
  return {
    uri: `spotify:track:${overrides.spotifyId}`,
    durationMs: 3 * 60_000,
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

describe("GetSongBpmAdapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("enriches a track with the BPM returned by the GetSongBPM search endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ search: [{ tempo: "128" }] }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new GetSongBpmAdapter("test-api-key");
    const track = makeTrack({ spotifyId: "s1", title: "Levels", artist: "Avicii" });

    const [result] = await adapter.enrichWithBpm([track]);

    expect(result.bpm).toBe(128);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestedUrl = fetchMock.mock.calls[0][0] as string;
    expect(requestedUrl).toContain("https://api.getsongbpm.com/search/");
    expect(requestedUrl).toContain("api_key=test-api-key");
    expect(requestedUrl).toContain(encodeURIComponent("song:Levels artist:Avicii"));
  });

  it("resolves bpm to null when the search returns no results", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ search: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new GetSongBpmAdapter("test-api-key");
    const track = makeTrack({ spotifyId: "s2", title: "No Match Track", artist: "Unknown Artist" });

    const [result] = await adapter.enrichWithBpm([track]);

    expect(result.bpm).toBeNull();
  });

  it("resolves bpm to null when the response is not ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, false));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new GetSongBpmAdapter("test-api-key");
    const track = makeTrack({
      spotifyId: "s3",
      title: "Rate Limited Track",
      artist: "Some Artist",
    });

    const [result] = await adapter.enrichWithBpm([track]);

    expect(result.bpm).toBeNull();
  });

  it("resolves bpm to null when fetch rejects", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network error"));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new GetSongBpmAdapter("test-api-key");
    const track = makeTrack({ spotifyId: "s4", title: "Offline Track", artist: "Some Artist" });

    const [result] = await adapter.enrichWithBpm([track]);

    expect(result.bpm).toBeNull();
  });

  it("caches lookups so the same artist/title pair is only fetched once", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ search: [{ tempo: "140" }] }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new GetSongBpmAdapter("test-api-key");
    const trackA = makeTrack({ spotifyId: "s5a", title: "Cached Track", artist: "Cache Artist" });
    const trackB = makeTrack({ spotifyId: "s5b", title: "Cached Track", artist: "Cache Artist" });

    const [resultA] = await adapter.enrichWithBpm([trackA]);
    const [resultB] = await adapter.enrichWithBpm([trackB]);

    expect(resultA.bpm).toBe(140);
    expect(resultB.bpm).toBe(140);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
