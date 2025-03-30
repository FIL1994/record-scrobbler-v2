import { isBrowser } from "./common";
import { LocalStorageKeys } from "./localStorageKeys";

/**
 * Get the Last.fm token from URL or localStorage
 */
export function getToken() {
  if (!isBrowser()) {
    return undefined;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get("token");

  if (urlToken) {
    localStorage.setItem(LocalStorageKeys.Token, urlToken);
    return urlToken;
  }

  const storedToken = localStorage.getItem(LocalStorageKeys.Token);
  if (storedToken) {
    return storedToken;
  }

  return undefined;
}

/**
 * Get the Last.fm session token from URL or localStorage
 */
export function getSessionToken() {
  if (!isBrowser()) {
    return undefined;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get("token");

  if (urlToken) {
    localStorage.setItem(LocalStorageKeys.SessionToken, urlToken);
    return urlToken;
  }

  const storedToken = localStorage.getItem(LocalStorageKeys.SessionToken);
  if (storedToken) {
    return storedToken;
  }

  return undefined;
}
