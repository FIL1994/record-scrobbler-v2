import { queryOptions } from "@tanstack/react-query";
import { getCollection, getTracklist } from "~/services/discogs";
import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { getUserInfo } from "~/services/lastfm";
import { getToken } from "./getToken";

const queryKeyStore = createQueryKeyStore({
  discogs: {
    collection: (username: string) => ["discogs", username],
    tracklist: (releaseId: number) => ["discogs", releaseId, "tracklist"],
  },
  lastfm: {
    session: (token: string) => ["lastfm", token],
    userInfo: (sessionToken: string) => ["lastfm", sessionToken, "user-info"],
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
        title: release.basic_information.title,
        artist: release.basic_information.artists[0].name,
        year: release.basic_information.year,
        coverImage: release.basic_information.cover_image,
      })),
    retry: false,
    initialData: [],
  });
};

export const discogsTracklistOptions = (releaseId: number) => {
  const key = queryKeyStore.discogs.tracklist(releaseId).queryKey;

  return queryOptions({
    queryKey: key,
    queryFn: () => getTracklist(releaseId),
    retry: false,
  });
};

export const lastfmSessionOptions = () => {
  const token = getToken();
  const key = queryKeyStore.lastfm.session(token!).queryKey;

  return queryOptions({
    queryKey: key,
    queryFn: () => getUserInfo(token!),
    retry: false,
    enabled: Boolean(token),
  });
};

export const lastfmUserInfoOptions = (sessionToken: string) => {
  const key = queryKeyStore.lastfm.session(sessionToken).queryKey;

  return queryOptions({
    queryKey: key,
    queryFn: () => getUserInfo(sessionToken),
    retry: false,
  });
};
