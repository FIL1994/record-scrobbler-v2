const LASTFM_API = "https://ws.audioscrobbler.com/2.0/";
const API_KEY = import.meta.env.VITE_LASTFM_API_KEY;

export async function scrobbleTrack(
  artist: string,
  track: string,
  album: string
) {
  const timestamp = Math.floor(Date.now() / 1000);

  const params = new URLSearchParams({
    method: "track.scrobble",
    artist,
    track,
    album,
    timestamp: timestamp.toString(),
    api_key: API_KEY,
    format: "json",
  });

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
