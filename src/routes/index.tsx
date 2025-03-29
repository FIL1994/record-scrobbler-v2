import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Music, Search } from "lucide-react";
import { useState } from "react";
import { AlbumCard } from "~/components/AlbumCard";
import { scrobbleTrack } from "~/services/lastfm";
import { Album } from "~/types";
import { discogsQueryOptions } from "~/utils/queries";
import { type } from "arktype";

export const Route = createFileRoute("/")({
  component: Home,
  validateSearch: type({
    username: "string?",
  }),
});

function Home() {
  const { username } = Route.useSearch({});
  const navigate = Route.useNavigate();
  const [savedUsername, setSavedUsername] = useState(username || "");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: collection,
    isLoading: loading,
    error,
  } = useQuery(discogsQueryOptions(savedUsername));

  console.log("collectionData", {
    collection,
    error,
  });

  const handleScrobble = async (album: Album) => {
    try {
      await scrobbleTrack({
        artist: album.artist,
        track: album.title,
        album: album.title,
        sessionToken: "", // TODO - get session token
      });
      console.log("Successfully scrobbled to Last.fm!");
    } catch (err) {
      console.error("Failed to scrobble track. Please try again.", err);
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Music className="text-red-600" size={24} />
            <h1 className="text-xl font-bold text-gray-900">
              Vinyl Collection Manager
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-4">
          <form
            className="flex gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSavedUsername(e.currentTarget.username.value);
              navigate({
                replace: true,
                search: {
                  username: e.currentTarget.username.value,
                },
              });
            }}
          >
            <input
              type="text"
              name="username"
              defaultValue={savedUsername}
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
      </main>
    </div>
  );
}
