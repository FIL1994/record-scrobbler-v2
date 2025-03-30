import { isBrowser } from "./common";
import { LocalStorageKeys } from "./localStorageKeys";

/**
 * Get the Last.fm token from URL or localStorage
 */
export function getToken() {
  if (!isBrowser()) {
    return undefined;
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

  const storedToken = localStorage.getItem(LocalStorageKeys.SessionToken);
  if (storedToken) {
    return storedToken;
  }

  return undefined;
}
