import { DiscogsRelease } from "~/types";

const DISCOGS_API = "https://api.discogs.com";

async function getMasterReleaseYear(masterId: number): Promise<number> {
  const token = import.meta.env.VITE_DISCOGS_TOKEN;

  const response = await fetch(
    `${DISCOGS_API}/masters/${masterId}?token=${token}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch master release");
  }

  const data = await response.json();
  return data.year;
}

export async function getCollection(username: string) {
  const token = import.meta.env.VITE_DISCOGS_TOKEN;

  const response = await fetch(
    `${DISCOGS_API}/users/${username}/collection/folders/0/releases?token=${token}`,
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
        } catch (error) {
          // Fallback to release year if master fetch fails
          return release;
        }
      }
      return release;
    }),
  );

  return releases;
}
