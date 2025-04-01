import type { LastfmUserInfoResponse } from "~/types";
import { normalizeArtistName } from "~/utils/common";

const LASTFM_API = "https://ws.audioscrobbler.com/2.0/";
const API_KEY = import.meta.env.VITE_LASTFM_API_KEY;

async function getSignature(params: URLSearchParams) {
  const { signature } = await fetch(`/api/sign`, {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(params.entries())),
  }).then((res) => res.json());
  return signature;
}

/**
 * Get a session key from Last.fm.
 * Session keys have an infinite lifetime by default. You are recommended to store the key securely.
 * Users are able to revoke privileges for your application on their Last.fm settings screen, rendering session keys invalid.
 * @see https://www.last.fm/api/webauth
 * @see https://www.last.fm/api/show/auth.getSession
 * @param token - The authentication token received at your callback url as a GET variable
 */
export async function getSession(token: string) {
  const params = new URLSearchParams({
    method: "auth.getSession",
    api_key: API_KEY,
    token,
  });

  const signature = await getSignature(params);
  params.set("api_sig", signature);
  params.set("format", "json");

  const response = await fetch(`${LASTFM_API}?${params}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to get session");
  }

  return (await response.json()).session.key as string;
}

const FALLBACK_TRACK_DURATION = 180; // 3 minutes

/**
 * Parse duration string in format MM:SS to seconds
 * @param duration Duration string in format MM:SS
 */
function parseDuration(duration: string): number {
  if (!duration) return FALLBACK_TRACK_DURATION; // Default to 3 minutes if no duration

  const parts = duration.split(":");
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
  }
  return FALLBACK_TRACK_DURATION; // Default to 3 minutes if parsing fails
}

/**
 * Scrobble tracks to Last.fm
 * @see https://www.last.fm/api/show/track.scrobble
 */
export async function scrobbleTracks({
  artist,
  tracks,
  token,
  album,
  cbUrl,
  durations,
}: {
  artist: string;
  tracks: string[];
  token: string;
  album?: string;
  cbUrl?: string;
  durations?: string[];
}) {
  const now = Math.floor(Date.now() / 1000);

  const params = new URLSearchParams({
    method: "track.scrobble",
    api_key: API_KEY,
    sk: token,
  });

  const timestamps: number[] = [];

  // Work backwards from the last track
  for (let i = tracks.length - 1; i >= 0; i--) {
    if (i === tracks.length - 1) {
      timestamps[i] = now;
    } else {
      const nextTrackDuration = durations?.[i + 1]
        ? parseDuration(durations[i + 1])
        : FALLBACK_TRACK_DURATION;
      timestamps[i] = timestamps[i + 1] - nextTrackDuration;
    }
  }

  for (let i = 0; i < tracks.length; i++) {
    params.set(`artist[${i}]`, normalizeArtistName(artist));
    params.set(`track[${i}]`, tracks[i]);
    params.set(`timestamp[${i}]`, timestamps[i].toString());

    if (album) {
      params.set(`album[${i}]`, album);
    }
  }

  if (cbUrl) {
    params.set("cb", cbUrl);
  }

  const signature = await getSignature(params);
  params.set("api_sig", signature);
  params.set("format", "json");

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

/**
 * Get information about a Last.fm user
 * @see https://www.last.fm/api/show/user.getInfo
 */
export async function getUserInfo(token: string) {
  const params = new URLSearchParams({
    method: "user.getInfo",
    api_key: API_KEY,
    sk: token,
  });

  const signature = await getSignature(params);
  params.set("api_sig", signature);
  params.set("format", "json");

  const response = await fetch(`${LASTFM_API}?${params}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to get user info");
  }

  const data = (await response.json()) as LastfmUserInfoResponse;
  return data.user;
}
