import type { LastfmUserInfoResponse } from "~/types";

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

/**
 * Scrobble a track to Last.fm
 * @see https://www.last.fm/api/show/track.scrobble
 */
export async function scrobbleTrack({
  artist,
  track,
  token,
  album,
  cbUrl,
}: {
  artist: string;
  track: string;
  token: string;
  album?: string;
  cbUrl?: string;
}) {
  // UNIX timestamp. Seconds since epoch. Must be in UTC time zone
  const timestamp = Math.floor(Date.now() / 1000);

  const params = new URLSearchParams({
    method: "track.scrobble",
    artist,
    track,
    timestamp: timestamp.toString(),
    api_key: API_KEY,
    sk: token,
  });

  if (album) {
    params.set("album", album);
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
