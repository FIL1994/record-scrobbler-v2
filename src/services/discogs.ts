import type {
  DiscogsRelease,
  DiscogsReleaseResponse,
  DiscogsArtistResponse,
  DiscogsArtistRelease,
  DiscogsSearchResponse,
  DiscogsMasterRelease,
} from "~/types";

const DISCOGS_API = "https://api.discogs.com";

/**
 * Get master release information from Discogs
 * @param masterId The Discogs master ID
 */
export async function getMasterRelease(
  masterId: number
): Promise<DiscogsMasterRelease> {
  const token = import.meta.env.VITE_DISCOGS_TOKEN;

  const response = await fetch(
    `${DISCOGS_API}/masters/${masterId}?token=${token}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch master release");
  }

  const data = await response.json();
  return data as DiscogsMasterRelease;
}

export async function getCollection(username: string) {
  const token = import.meta.env.VITE_DISCOGS_TOKEN || "";

  const response = await fetch(
    `${DISCOGS_API}/users/${username}/collection/folders/0/releases?token=${token}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch collection");
  }

  const data = (await response.json()) as {
    releases: DiscogsRelease[];
  };

  // Process releases to get master release years
  const releases = await Promise.all(
    data.releases.map(async (release) => {
      if (release.basic_information.master_id) {
        try {
          // const masterYear = await getMasterReleaseYear(
          //   release.basic_information.master_id
          // );
          return {
            ...release,
            basic_information: {
              ...release.basic_information,
              // year: masterYear || release.basic_information.year,
              year: release.basic_information.year,
            },
          };
        } catch {
          // Fallback to release year if master fetch fails
          return release;
        }
      }
      return release;
    })
  );

  return releases;
}

/**
 * Get the tracklist for a release
 * @see https://www.discogs.com/developers#page:database,header:database-release
 */
export async function getReleaseInfo(releaseId: number) {
  const token = import.meta.env.VITE_DISCOGS_TOKEN || "";

  const response = await fetch(
    `${DISCOGS_API}/releases/${releaseId}?token=${token}&page=1&per_page=1`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch release tracklist");
  }

  return (await response.json()) as DiscogsReleaseResponse;
}

/**
 * Get information about an artist and their releases
 * @see https://www.discogs.com/developers#page:database,header:database-artist
 */
export async function getArtistInfo(artistId: number) {
  const token = import.meta.env.VITE_DISCOGS_TOKEN || "";

  const response = await fetch(
    `${DISCOGS_API}/artists/${artistId}?token=${token}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch artist information");
  }

  return (await response.json()) as DiscogsArtistResponse;
}

/**
 * Get the releases (albums) by an artist
 * @see https://www.discogs.com/developers#page:database,header:database-artist-releases
 */
export async function getArtistReleases(
  artistId: number,
  page = 1,
  perPage = 12
) {
  const token = import.meta.env.VITE_DISCOGS_TOKEN || "";

  const params = new URLSearchParams({
    token,
    sort: "year",
    sort_order: "desc",
    page: page.toString(),
    per_page: perPage.toString(),
  });

  const response = await fetch(
    `${DISCOGS_API}/artists/${artistId}/releases?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch artist releases");
  }

  const data = await response.json();
  return data as { pagination: any; releases: DiscogsArtistRelease[] };
}

/**
 * Search for albums on Discogs
 * @see https://www.discogs.com/developers#page:database,header:database-search
 */
export async function searchAlbums(query: string, page = 1, perPage = 12) {
  const token = import.meta.env.VITE_DISCOGS_TOKEN || "";

  const params = new URLSearchParams({
    q: query,
    token,
    page: page.toString(),
    per_page: perPage.toString(),
    type: "master",
  });

  const response = await fetch(
    `${DISCOGS_API}/database/search?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to search albums");
  }

  return (await response.json()) as DiscogsSearchResponse;
}
