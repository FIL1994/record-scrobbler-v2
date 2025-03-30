import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Share2 } from "lucide-react";
import { useState } from "react";
import { scrobbleTrack } from "~/services/lastfm";
import { getToken } from "~/utils/getToken";
import { discogsReleaseOptions } from "~/utils/queries";

export const Route = createFileRoute("/release/$id")({
  component: ReleaseComponent,
});

function ReleaseComponent() {
  const { id } = Route.useParams();
  const { data: release } = useQuery(discogsReleaseOptions(Number(id)));
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());

  if (!release) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const coverImage = release.images?.[0]?.uri;
  const handleScrobble = async () => {
    const lastfmToken = getToken();
    if (!lastfmToken) {
      throw new Error("No Last.fm token found");
    }

    const selectedTrackObjects = release.tracklist.filter(
      (track: { position: string }) => selectedTracks.has(track.position),
    );

    try {
      await Promise.all(
        selectedTrackObjects.map(
          (track: { artists?: Array<{ name: string }>; title: string }) =>
            scrobbleTrack({
              artist: track.artists?.[0]?.name || release.artists[0].name,
              track: track.title,
              token: lastfmToken,
              album: release.title,
            }),
        ),
      );
      console.log("Successfully scrobbled tracks!");
      setSelectedTracks(new Set());
    } catch (err) {
      console.error("Failed to scrobble tracks. Please try again.", err);
    }
  };

  const toggleTrack = (position: string) => {
    const newSelected = new Set(selectedTracks);
    if (newSelected.has(position)) {
      newSelected.delete(position);
    } else {
      newSelected.add(position);
    }
    setSelectedTracks(newSelected);
  };

  const toggleAll = () => {
    if (selectedTracks.size === release.tracklist.length) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(release.tracklist.map((t) => t.position)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Collection
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 flex gap-6">
            {coverImage && (
              <img
                src={coverImage}
                alt={`${release.title} cover`}
                className="w-48 h-48 object-cover rounded-md"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {release.title}
              </h1>
              <p className="text-lg text-gray-600">{release.artists[0].name}</p>
              <p className="text-gray-500">{release.year}</p>

              {selectedTracks.size > 0 && (
                <button
                  onClick={handleScrobble}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Share2 size={16} />
                  Scrobble {selectedTracks.size} Track
                  {selectedTracks.size === 1 ? "" : "s"}
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 relative">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedTracks.size === release.tracklist.length
                          }
                          onChange={toggleAll}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {release.tracklist.map(
                    (track: {
                      position: string;
                      title: string;
                      duration: string;
                    }) => (
                      <tr
                        key={track.position}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleTrack(track.position)}
                      >
                        <td className="w-16 px-3 py-4 whitespace-nowrap">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={selectedTracks.has(track.position)}
                              onChange={() => toggleTrack(track.position)}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {track.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {track.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {track.duration}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
