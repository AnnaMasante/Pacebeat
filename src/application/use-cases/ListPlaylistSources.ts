import type { MusicSourcePort, PlaylistSummary } from "../ports/MusicSourcePort";

export class ListPlaylistSources {
  constructor(private readonly musicSource: MusicSourcePort) {}

  execute(): Promise<PlaylistSummary[]> {
    return this.musicSource.listUserPlaylists();
  }
}
