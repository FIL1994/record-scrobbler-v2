const LASTFM_API = "https://ws.audioscrobbler.com/2.0/";
const API_KEY = import.meta.env.VITE_LASTFM_API_KEY;

/**
 * Scrobble a track to Last.fm
 * @see https://www.last.fm/api/show/track.scrobble
 */
export async function scrobbleTrack({
  artist,
  track,
  sessionToken,
  album,
  cbUrl,
}: {
  artist: string;
  track: string;
  sessionToken: string;
  album?: string;
  cbUrl?: string;
}) {
  const timestamp = Math.floor(Date.now() / 1000);

  const params = new URLSearchParams({
    method: "track.scrobble",
    artist,
    track,
    timestamp: timestamp.toString(),
    api_key: API_KEY,
    format: "json",
    token: sessionToken,
  });

  if (album) {
    params.set("album", album);
  }

  if (cbUrl) {
    params.set("cb", cbUrl);
  }

  const response = await fetch(`${LASTFM_API}?${params}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to scrobble track");
  }

  return response.json();
}
