import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { AlbumCard } from "~/components/AlbumCard";
import { ArtistLinks } from "~/components/ArtistLinks";
import { ArtistProfile } from "~/components/ArtistProfile";
import { PageContainer } from "~/components/PageContainer";
import { Pagination } from "~/components/Pagination";
import { useScrobbleAlbum } from "~/hooks/useScrobbleAlbum";
import type { RouterContext } from "~/router";
import type { Album } from "~/types";
import { normalizeArtistName } from "~/utils/common";
import {
  discogsArtistOptions,
  discogsArtistReleasesOptions,
} from "~/utils/queries";
import { ViewTransitionType } from "~/utils/viewTransitions";

export const Route = createFileRoute("/artist/$id")({
  component: ArtistComponent,
  loader: ({ context, params: { id } }) => {
    const { queryClient } = context as RouterContext;
    return Promise.all([
      queryClient.ensureQueryData(discogsArtistOptions(Number(id))),
      queryClient.ensureQueryData(discogsArtistReleasesOptions(Number(id))),
    ]);
  },
  pendingComponent: Loading,
  ssr: false,
});

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500">Loading...</div>
    </div>
  );
}

function ArtistComponent() {
  const { id } = Route.useParams();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: artist } = useQuery(discogsArtistOptions(Number(id)));
  const { data: releasesData, isLoading: isReleasesLoading } = useQuery(
    discogsArtistReleasesOptions(Number(id), currentPage)
  );
  const { scrobbleAlbum, scrobblingAlbums } = useScrobbleAlbum();

  if (!artist) {
    return <Loading />;
  }

  const releases = releasesData?.results || [];
  const pagination = releasesData?.pagination;

  const artistImage = artist.images?.[0]?.uri;

  return (
    <PageContainer className="max-w-7xl">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 dark:text-gray-400 dark:hover:text-gray-200"
        viewTransition={{
          types: [ViewTransitionType.Flip],
        }}
      >
        <ArrowLeft size={20} />
        Back to Collection
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-900 dark:border dark:border-gray-800 mb-10">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
          {artistImage && (
            <img
              src={artistImage}
              alt={`${artist.name}`}
              className="w-48 h-48 object-cover rounded-md self-center md:self-start"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {normalizeArtistName(artist.name)}
            </h1>

            {artist.profile && (
              <div className="mt-4">
                <ArtistProfile profile={artist.profile} />
              </div>
            )}

            {artist.urls && <ArtistLinks urls={artist.urls} />}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Discography
      </h2>

      {isReleasesLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100" />
        </div>
      ) : releases.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No releases found for this artist.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {releases.map((album: Album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onScrobble={scrobbleAlbum}
                isScrobbling={Boolean(scrobblingAlbums[album.id])}
                showArtistLink={false}
              />
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}
    </PageContainer>
  );
}
