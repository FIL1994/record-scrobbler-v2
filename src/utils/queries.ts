import { queryOptions } from "@tanstack/react-query";
import { getCollection, getReleaseInfo } from "~/services/discogs";
import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { getUserInfo } from "~/services/lastfm";
import { getSessionToken } from "./getToken";

const queryKeyStore = createQueryKeyStore({
  discogs: {
    collection: (username: string) => [username],
    release: (releaseId: number) => [releaseId],
  },
  lastfm: {
    userInfo: (sessionToken: string) => [sessionToken, "user-info"],
  },
});

export const discogsCollectionOptions = (username: string) => {
  const key = queryKeyStore.discogs.collection(username).queryKey;

  return queryOptions({
    queryKey: key,
    queryFn: () => getCollection(username),
    enabled: Boolean(username),
    select: (data) =>
      data.map((release) => ({
        id: release.id,
        title: release.basic_information.title,
        artist: release.basic_information.artists[0].name,
        year: release.basic_information.year,
        coverImage: release.basic_information.cover_image,
      })),
    retry: false,
    placeholderData: [],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const discogsReleaseOptions = (releaseId: number) => {
  const key = queryKeyStore.discogs.release(releaseId).queryKey;

  return queryOptions({
    queryKey: key,
    queryFn: () => getReleaseInfo(releaseId),
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });
};

export const lastfmUserInfoOptions = () => {
  const sessionToken = getSessionToken();
  const key = queryKeyStore.lastfm.userInfo(sessionToken!).queryKey;

  return queryOptions({
    queryKey: key,
    queryFn: () => getUserInfo(sessionToken!),
    retry: false,
    enabled: Boolean(sessionToken),
  });
};
