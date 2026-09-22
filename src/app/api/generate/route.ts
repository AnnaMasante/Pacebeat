import { auth } from "@/infrastructure/auth/authOptions";
import { createGenerateRacePlaylistUseCase } from "@/app/composition/container";
import type { RaceConfig } from "@/domain/entities/RaceConfig";
import type { GeneratedPlaylist } from "@/domain/entities/GeneratedPlaylist";
import type { GenerateProgress } from "@/application/use-cases/GenerateRacePlaylist";

// Vercel Hobby's function-duration ceiling. With ISRC-only Deezer lookups (1 request/track,
// 50 req/5s), a 400-track playlist tops out around ~40s — comfortably inside this budget.
export const maxDuration = 60;

export type StreamEvent =
  | ({ type: "progress" } & GenerateProgress)
  | { type: "result"; playlist: GeneratedPlaylist }
  | { type: "error"; message: string };

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.accessToken) {
    return new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
  }
  if (session.error === "RefreshAccessTokenError") {
    return new Response(
      JSON.stringify({ message: "Spotify session expired, please sign in again" }),
      { status: 401 },
    );
  }

  const config = (await request.json()) as RaceConfig;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
        const useCase = createGenerateRacePlaylistUseCase(session.accessToken!);
        const playlist = await useCase.execute(config, (progress) =>
          send({ type: "progress", ...progress }),
        );
        send({ type: "result", playlist });
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "La génération a échoué.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
