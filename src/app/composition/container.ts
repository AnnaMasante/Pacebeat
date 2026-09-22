import { SpotifyMusicSourceAdapter } from "@/infrastructure/spotify/SpotifyMusicSourceAdapter";
import { SpotifyPlaylistPublisherAdapter } from "@/infrastructure/spotify/SpotifyPlaylistPublisherAdapter";
import { DeezerAdapter } from "@/infrastructure/deezer/DeezerAdapter";
import { GenerateRacePlaylist } from "@/application/use-cases/GenerateRacePlaylist";
import { ConfirmAndCreatePlaylist } from "@/application/use-cases/ConfirmAndCreatePlaylist";
import { ListPlaylistSources } from "@/application/use-cases/ListPlaylistSources";

export function createGenerateRacePlaylistUseCase(accessToken: string): GenerateRacePlaylist {
  const musicSource = new SpotifyMusicSourceAdapter(accessToken);
  const tempoLookup = new DeezerAdapter();
  return new GenerateRacePlaylist(musicSource, tempoLookup);
}

export function createConfirmAndCreatePlaylistUseCase(
  accessToken: string,
): ConfirmAndCreatePlaylist {
  return new ConfirmAndCreatePlaylist(new SpotifyPlaylistPublisherAdapter(accessToken));
}

export function createListPlaylistSourcesUseCase(accessToken: string): ListPlaylistSources {
  return new ListPlaylistSources(new SpotifyMusicSourceAdapter(accessToken));
}
