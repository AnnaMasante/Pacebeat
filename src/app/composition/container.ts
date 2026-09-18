import { SpotifyMusicSourceAdapter } from "@/infrastructure/spotify/SpotifyMusicSourceAdapter";
import { SpotifyPlaylistPublisherAdapter } from "@/infrastructure/spotify/SpotifyPlaylistPublisherAdapter";
import { GetSongBpmAdapter } from "@/infrastructure/getsongbpm/GetSongBpmAdapter";
import { GenerateRacePlaylist } from "@/application/use-cases/GenerateRacePlaylist";
import { ConfirmAndCreatePlaylist } from "@/application/use-cases/ConfirmAndCreatePlaylist";
import { ListPlaylistSources } from "@/application/use-cases/ListPlaylistSources";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function createGenerateRacePlaylistUseCase(accessToken: string): GenerateRacePlaylist {
  const musicSource = new SpotifyMusicSourceAdapter(accessToken);
  const tempoLookup = new GetSongBpmAdapter(requireEnv("GETSONGBPM_API_KEY"));
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
