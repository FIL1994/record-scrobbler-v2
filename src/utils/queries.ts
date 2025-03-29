import { queryOptions } from "@tanstack/react-query";
import { getCollection } from "~/services/discogs";
import { createQueryKeyStore } from "@lukemorales/query-key-factory";

const queryKeyStore = createQueryKeyStore({
  discogs: {
    username: (username: string) => ["discogs", username],
  },
});

export const discogsQueryOptions = (username: string) => {
  const key = queryKeyStore.discogs.username(username).queryKey;

  return queryOptions({
    queryKey: key,
    queryFn: () => getCollection(username),
    enabled: Boolean(username),
    select: (data) =>
      data.map((release) => ({
        title: release.basic_information.title,
        artist: release.basic_information.artists[0].name,
        year: release.basic_information.year,
        coverImage: release.basic_information.cover_image,
      })),
    retry: false,
    initialData: [],
  });
};
