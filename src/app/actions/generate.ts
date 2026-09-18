"use server";

import { auth } from "@/infrastructure/auth/authOptions";
import type { RaceConfig } from "@/domain/entities/RaceConfig";
import type { GeneratedPlaylist } from "@/domain/entities/GeneratedPlaylist";
import { createGenerateRacePlaylistUseCase } from "@/app/composition/container";

export async function generateRacePlaylist(config: RaceConfig): Promise<GeneratedPlaylist> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Not authenticated");
  }
  if (session.error === "RefreshAccessTokenError") {
    throw new Error("Spotify session expired, please sign in again");
  }

  return createGenerateRacePlaylistUseCase(session.accessToken).execute(config);
}
