import { useState } from "react";
import { Music, Search } from "lucide-react";
import { getCollection } from "./services/discogs";
import { scrobbleTrack } from "./services/lastfm";
import { AlbumCard } from "./components/AlbumCard";
import type { Album, DiscogsRelease } from "./types";

function App() {
  const [username, setUsername] = useState("");
  const [collection, setCollection] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCollection = async (username: string) => {
    try {
      setLoading(true);
      setError(null);
      const releases = await getCollection(username);
      const albums: Album[] = releases.map((release: DiscogsRelease) => ({
        title: release.basic_information.title,
        artist: release.basic_information.artists[0].name,
        year: release.basic_information.year,
        coverImage: release.basic_information.cover_image,
      }));
      setCollection(albums);
    } catch (err) {
      setError(
        "Failed to fetch collection. Please check your username and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScrobble = async (album: Album) => {
    try {
      await scrobbleTrack(album.artist, album.title, album.title);
      alert("Successfully scrobbled to Last.fm!");
    } catch (err) {
      alert("Failed to scrobble track. Please try again.");
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
          <div className="flex gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your Discogs username"
              className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => fetchCollection(username)}
              disabled={loading || !username}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Fetch Collection"}
            </button>
          </div>
          {error && <p className="mt-2 text-red-600">{error}</p>}

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

export default App;
