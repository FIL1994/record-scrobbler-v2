import { queryOptions } from "@tanstack/react-query";
import { getCollection, getReleaseInfo } from "~/services/discogs";
import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { getSession, getUserInfo } from "~/services/lastfm";
import { getToken } from "./getToken";

const queryKeyStore = createQueryKeyStore({
  discogs: {
    collection: (username: string) => [username],
    release: (releaseId: number) => [releaseId],
  },
  lastfm: {
    session: (token: string) => [token],
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

export const lastfmSessionOptions = () => {
  const token = getToken();
  const key = queryKeyStore.lastfm.session(token!).queryKey;

  return queryOptions({
    queryKey: key,
    queryFn: () => getSession(token!),
    retry: false,
    enabled: Boolean(token),
  });
};

export const lastfmUserInfoOptions = (sessionToken: string | undefined) => {
  const key = queryKeyStore.lastfm.session(sessionToken!).queryKey;

  return queryOptions({
    queryKey: key,
    queryFn: () => getUserInfo(sessionToken!),
    retry: false,
    enabled: Boolean(sessionToken),
  });
};
