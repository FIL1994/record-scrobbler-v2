import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { scrobbleTracks } from "~/services/lastfm";
import type { Album } from "~/types";
import { getSessionToken } from "~/utils/getToken";
import { discogsReleaseOptions } from "~/utils/queries";

export function useScrobbleAlbum() {
  const queryClient = useQueryClient();

  const [albumsScrobbling, setAlbumsScrobbling] = useState<
    Record<number, boolean>
  >({});

  const scrobbleAlbum = async (album: Album) => {
    const lastfmToken = getSessionToken();
    if (!lastfmToken) {
      throw new Error("No Last.fm token found");
    }

    setAlbumsScrobbling((prev) => ({
      ...prev,
      [album.id]: true,
    }));

    try {
      const releaseQueryOptions = discogsReleaseOptions(album.id);

      let releaseInfo = queryClient.getQueryData(releaseQueryOptions.queryKey);
      if (!releaseInfo) {
        releaseInfo = await queryClient.fetchQuery(releaseQueryOptions);
      }

      const filteredTracks = releaseInfo.tracklist.filter(
        (track) => track.type_ !== "heading"
      );

      const trackTitles = filteredTracks.map((track) => track.title);
      const trackDurations = filteredTracks.map((track) => track.duration);

      if (trackTitles.length === 0) {
        throw new Error("No tracks found for this album");
      }

      await scrobbleTracks({
        artist: album.artist,
        tracks: trackTitles,
        album: album.title,
        token: lastfmToken,
        durations: trackDurations,
      });

      toast.success(
        `Successfully scrobbled ${trackTitles.length} tracks from ${album.title}!`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to scrobble: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error("Failed to scrobble tracks. Please try again.", err);
    } finally {
      // Remove this album from the scrobbling state regardless of success/failure
      setAlbumsScrobbling((prev) => {
        const updated = { ...prev };
        delete updated[album.id];
        return updated;
      });
    }
  };

  return {
    scrobbleAlbum,
    scrobblingAlbums: albumsScrobbling,
  };
}
