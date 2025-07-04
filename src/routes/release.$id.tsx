import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { type } from "arktype";
import { ArrowLeft, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { PageContainer } from "~/components/PageContainer";
import { TrackTable } from "~/components/TrackTable";
import type { RouterContext } from "~/router";
import { scrobbleTracks } from "~/services/lastfm";
import { normalizeArtistName } from "~/utils/common";
import { getSessionToken } from "~/utils/getToken";
import { discogsReleaseOptions } from "~/utils/queries";
import { ViewTransitionType } from "~/utils/viewTransitions";

export const Route = createFileRoute("/release/$id")({
  component: ReleaseComponent,
  validateSearch: type({
    from: ["'collection' | 'search'", "?"],
  }),
  loader: ({ context, params: { id } }) => {
    const { queryClient } = context as RouterContext;
    // return queryClient.ensureQueryData(discogsReleaseOptions(Number(id)));
    return queryClient.prefetchQuery(discogsReleaseOptions(Number(id)));
  },
  ssr: false,
});

function ReleaseComponent() {
  const { id } = Route.useParams();
  const { from } = Route.useSearch();
  const { data: release } = useSuspenseQuery(discogsReleaseOptions(Number(id)));

  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(
    () => new Set(release.tracklist.map((track) => track.position))
  );

  if (!release) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

    try {
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
    <PageContainer className="max-w-5xl">
      {from === "collection" ? (
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
          viewTransition={{
            types: [ViewTransitionType.Flip],
          }}
        >
          <ArrowLeft size={20} />
          Back to Collection
        </Link>
      ) : from === "search" ? (
        <Link
          to="/search-album"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
          viewTransition={{
            types: [ViewTransitionType.Flip],
          }}
        >
          <ArrowLeft size={20} />
          Back to Search
        </Link>
      ) : null}

      <div className="bg-white rounded-lg shadow-md overflow-hidden [view-transition-name:main-content]">
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
            <Link
              to="/artist/$id"
              params={{ id: release.artists[0].id.toString() }}
              className="text-lg text-gray-600 hover:text-blue-600 transition-colors"
              viewTransition
            >
              {normalizeArtistName(release.artists[0].name)}
            </Link>
            {!!release.year && <p className="text-gray-500">{release.year}</p>}

            <button
              disabled={selectedTracks.size === 0}
              onClick={handleScrobble}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:hover:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Share2 size={16} />
              Scrobble {selectedTracks.size} Track
              {selectedTracks.size === 1 ? "" : "s"}
            </button>
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
    </PageContainer>
  );
}
