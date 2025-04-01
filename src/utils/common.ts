export const isBrowser = () => typeof window !== "undefined";

/**
 * Cleans up artist names by removing Discogs-style numbering patterns like "(2)" or "(3)"
 * that are added when there are multiple artists with the same name.
 *
 * @param artistName - The artist name to clean up
 * @returns The cleaned artist name
 */
export function normalizeArtistName(artistName: string): string {
  return artistName.replace(/\s+\(\d+\)$/, "");
}
