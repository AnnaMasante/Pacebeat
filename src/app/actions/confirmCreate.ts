"use server";

import { auth } from "@/infrastructure/auth/authOptions";
import type {
  PublishedPlaylist,
  PublishPlaylistParams,
} from "@/application/ports/PlaylistPublisherPort";
import { createConfirmAndCreatePlaylistUseCase } from "@/app/composition/container";

export async function confirmCreatePlaylist(
  params: PublishPlaylistParams,
): Promise<PublishedPlaylist> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Not authenticated");
  }
  if (session.error === "RefreshAccessTokenError") {
    throw new Error("Spotify session expired, please sign in again");
  }

  return createConfirmAndCreatePlaylistUseCase(session.accessToken).execute(params);
}
