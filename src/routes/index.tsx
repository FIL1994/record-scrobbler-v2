import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type } from "arktype";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AlbumCard } from "~/components/AlbumCard";
import { PageContainer } from "~/components/PageContainer";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { scrobbleTracks } from "~/services/lastfm";
import type { Album } from "~/types";
import { getSessionToken, getToken } from "~/utils/getToken";
import { LocalStorageKeys } from "~/utils/localStorageKeys";
import { discogsCollectionOptions } from "~/utils/queries";
import { discogsReleaseOptions } from "~/utils/queries";

export const Route = createFileRoute("/")({
  component: Home,
  validateSearch: type({
    username: "string?",
  }),
});

enum FormNames {
  Username = "discogs-username",
}

function Home() {
  const queryClient = useQueryClient();
  const { username } = Route.useSearch({});
  const [savedUsername, setSavedUsername] = useLocalStorage(
    LocalStorageKeys.Username,
    username || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [scrobblingAlbums, setScrobblingAlbums] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    getToken();
  }, []);

  const {
    data: collection = [],
    isLoading: loading,
    error,
  } = useQuery(discogsCollectionOptions(savedUsername));

  console.log("collectionData", {
    savedUsername,
    collection,
    error,
  });

  const handleScrobble = async (album: Album) => {
    const lastfmToken = getSessionToken();
    if (!lastfmToken) {
      throw new Error("No Last.fm token found");
    }

    // Set this album as currently scrobbling
    setScrobblingAlbums((prev) => ({
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
      setScrobblingAlbums((prev) => {
        const updated = { ...prev };
        delete updated[album.id];
        return updated;
      });
    }
  };

  const filteredCollection = collection.filter((album) => {
    const query = searchQuery.toLowerCase();
    return (
      album.title.toLowerCase().includes(query) ||
      album.artist.toLowerCase().includes(query) ||
      album.year.toString().includes(query)
    );
  });

  return (
    <PageContainer>
      <div className="mb-8 space-y-4">
        <form
          className="flex gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSavedUsername(e.currentTarget[FormNames.Username].value);
          }}
        >
          <input
            type="text"
            name={FormNames.Username}
            autoComplete="on"
            defaultValue={savedUsername}
            aria-label="Enter your Discogs username"
            placeholder="Enter your Discogs username"
            className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Fetch Collection"}
          </button>
        </form>
        {error && <p className="mt-2 text-red-600">{error.message}</p>}

        {collection.length > 0 && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search by title, artist, or year..."
              placeholder="Search by title, artist, or year..."
              className="pl-10 w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCollection.map((album, index) => (
          <AlbumCard
            key={`${album.title}-${index}`}
            album={album}
            onScrobble={handleScrobble}
            isScrobbling={Boolean(scrobblingAlbums[album.id])}
            showArtistLink
          />
        ))}
      </div>

      {collection.length === 0 && !loading && (
        <div className="text-center text-gray-500">
          Enter your Discogs username to see your vinyl collection
        </div>
      )}

      {collection.length > 0 && filteredCollection.length === 0 && (
        <div className="text-center text-gray-500">
          No albums found matching your search
        </div>
      )}
    </PageContainer>
  );
}
