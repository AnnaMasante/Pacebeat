const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

export class SpotifyApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "SpotifyApiError";
  }
}

export async function spotifyFetch<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${SPOTIFY_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new SpotifyApiError(`Spotify API error on ${path}: ${body}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

interface SpotifyPage<TItem> {
  items: TItem[];
  next: string | null;
}

export async function fetchAllPages<TItem>(
  accessToken: string,
  firstPath: string,
): Promise<TItem[]> {
  const items: TItem[] = [];
  let nextPath: string | null = firstPath;

  while (nextPath) {
    const page: SpotifyPage<TItem> = await spotifyFetch<SpotifyPage<TItem>>(accessToken, nextPath);
    items.push(...page.items);
    nextPath = page.next ? page.next.replace(SPOTIFY_API_BASE_URL, "") : null;
  }

  return items;
}
