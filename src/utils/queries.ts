import { queryOptions } from "@tanstack/react-query";
import {
  getCollection,
  getReleaseInfo,
  getArtistInfo,
  getArtistReleases,
} from "~/services/discogs";
import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { getUserInfo } from "~/services/lastfm";
import { getSessionToken } from "./getToken";
import { minutesToMilliseconds } from "date-fns";
import type { Album } from "~/types";

const queryKeyStore = createQueryKeyStore({
  discogs: {
    collection: (username: string) => [username],
    release: (releaseId: number) => [releaseId],
    artist: (artistId: number) => [artistId],
    artistReleases: (artistId: number) => [artistId, "releases"],
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
      data.map(
        (release) =>
          ({
            id: release.id,
            title: release.basic_information.title,
            artist: release.basic_information.artists[0].name,
            artistId: release.basic_information.artists[0].id,
            year: release.basic_information.year,
            coverImage: release.basic_information.cover_image,
          }) satisfies Album
      ),
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
    gcTime: minutesToMilliseconds(30),
  });
};

export const discogsArtistOptions = (artistId: number) => {
  const key = queryKeyStore.discogs.artist(artistId).queryKey;

  return queryOptions({
    queryKey: key,
    queryFn: () => getArtistInfo(artistId),
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: minutesToMilliseconds(30),
  });
};

export const discogsArtistReleasesOptions = (artistId: number) => {
  const key = queryKeyStore.discogs.artistReleases(artistId).queryKey;

  return queryOptions({
    queryKey: key,
    queryFn: () => getArtistReleases(artistId),
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: minutesToMilliseconds(60),
    select: (data) =>
      data
        .filter(
          (release) => release.type === "master" || release.type === "release"
        )
        .map((release) => ({
          id: release.type === "master" ? release.main_release! : release.id,
          title: release.title,
          year: release.year || 0,
          coverImage: release.thumb,
          type: release.type,
          format: release.format,
          artist: release.artist,
          artistId: artistId,
        })),
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
