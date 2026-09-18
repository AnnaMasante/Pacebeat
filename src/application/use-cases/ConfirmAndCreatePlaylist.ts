import type {
  PlaylistPublisherPort,
  PublishedPlaylist,
  PublishPlaylistParams,
} from "../ports/PlaylistPublisherPort";

export class ConfirmAndCreatePlaylist {
  constructor(private readonly playlistPublisher: PlaylistPublisherPort) {}

  execute(params: PublishPlaylistParams): Promise<PublishedPlaylist> {
    return this.playlistPublisher.publish(params);
  }
}
