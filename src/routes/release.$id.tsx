import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Share2 } from "lucide-react";
import { useState } from "react";
import { TrackTable } from "~/components/TrackTable";
import { scrobbleTracks } from "~/services/lastfm";
import { getSessionToken } from "~/utils/getToken";
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
    const lastfmToken = getSessionToken();
    if (!lastfmToken) {
      throw new Error("No Last.fm token found");
    }

    const selectedTrackObjects = release.tracklist.filter(
      (track: { position: string }) => selectedTracks.has(track.position)
    );

    scrobbleTracks({
      artist: release.artists[0].name,
      token: lastfmToken,
      album: release.title,
      tracks: selectedTrackObjects.map((track) => track.title),
    });

    try {
      // await Promise.all(
      //   selectedTrackObjects.map(
      //     (track: { artists?: Array<{ name: string }>; title: string }) =>
      //       scrobbleTracks({
      //         artist: track.artists?.[0]?.name || release.artists[0].name,
      //         track: track.title,
      //         token: lastfmToken,
      //         album: release.title,
      //       })
      //   )
      // );
      await scrobbleTracks({
        artist: release.artists[0].name,
        token: lastfmToken,
        album: release.title,
        tracks: selectedTrackObjects.map((track) => track.title),
      });

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
          <TrackTable
            data={release.tracklist}
            selectedTracks={selectedTracks}
            onToggleTrack={toggleTrack}
            onToggleAll={toggleAll}
          />
        </div>
      </div>
    </div>
  );
}
