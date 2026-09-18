export interface PublishPlaylistParams {
  name: string;
  description?: string;
  trackUris: string[];
}

export interface PublishedPlaylist {
  spotifyPlaylistId: string;
  externalUrl: string;
}

export interface PlaylistPublisherPort {
  publish(params: PublishPlaylistParams): Promise<PublishedPlaylist>;
}
