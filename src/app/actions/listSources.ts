"use server";

import { auth } from "@/infrastructure/auth/authOptions";
import type { PlaylistSummary } from "@/application/ports/MusicSourcePort";
import { createListPlaylistSourcesUseCase } from "@/app/composition/container";

export async function listPlaylistSources(): Promise<PlaylistSummary[]> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Not authenticated");
  }
  if (session.error === "RefreshAccessTokenError") {
    throw new Error("Spotify session expired, please sign in again");
  }

  return createListPlaylistSourcesUseCase(session.accessToken).execute();
}
