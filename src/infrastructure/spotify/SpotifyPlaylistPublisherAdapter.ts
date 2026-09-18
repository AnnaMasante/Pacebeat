import type {
  PlaylistPublisherPort,
  PublishedPlaylist,
  PublishPlaylistParams,
} from "@/application/ports/PlaylistPublisherPort";
import { spotifyFetch } from "./spotifyApiClient";

const MAX_TRACKS_PER_ADD_REQUEST = 100;

interface SpotifyMeResponse {
  id: string;
}

interface SpotifyCreatePlaylistResponse {
  id: string;
  external_urls: { spotify: string };
}

export class SpotifyPlaylistPublisherAdapter implements PlaylistPublisherPort {
  constructor(private readonly accessToken: string) {}

  async publish(params: PublishPlaylistParams): Promise<PublishedPlaylist> {
    const me = await spotifyFetch<SpotifyMeResponse>(this.accessToken, "/me");

    const playlist = await spotifyFetch<SpotifyCreatePlaylistResponse>(
      this.accessToken,
      `/users/${me.id}/playlists`,
      {
        method: "POST",
        body: JSON.stringify({
          name: params.name,
          description: params.description ?? "",
          public: false,
        }),
      },
    );

    for (let i = 0; i < params.trackUris.length; i += MAX_TRACKS_PER_ADD_REQUEST) {
      const batch = params.trackUris.slice(i, i + MAX_TRACKS_PER_ADD_REQUEST);
      await spotifyFetch(this.accessToken, `/playlists/${playlist.id}/tracks`, {
        method: "POST",
        body: JSON.stringify({ uris: batch }),
      });
    }

    return { spotifyPlaylistId: playlist.id, externalUrl: playlist.external_urls.spotify };
  }
}
