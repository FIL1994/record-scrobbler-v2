import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlbumCard } from "~/components/AlbumCard";
import { PageContainer } from "~/components/PageContainer";
import { useScrobbleAlbum } from "~/hooks/useScrobbleAlbum";
import { discogsSearchOptions } from "~/utils/queries";
import { ViewTransitionType } from "~/utils/viewTransitions";
import { useDebouncedValue } from "~/hooks/useDebouncedValue";

export const Route = createFileRoute("/search-album")({
  component: SearchAlbum,
});

function SearchAlbum() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const { scrobbleAlbum, scrobblingAlbums } = useScrobbleAlbum();

  console.log({
    searchQuery,
    debouncedQuery,
  });

  const { data, isLoading, isError } = useQuery(
    discogsSearchOptions(debouncedQuery, currentPage)
  );

  function handlePageChange(newPage: number) {
    if (newPage < 1 || (data?.pagination && newPage > data.pagination.pages)) {
      return;
    }
    setCurrentPage(newPage);
  }

  return (
    <PageContainer className="max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Search Albums
      </h1>

      <div className="mb-8">
        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search for albums on Discogs..."
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
        </div>
      </div>

      {isLoading && debouncedQuery && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
        </div>
      )}

      {isError && (
        <div className="text-red-500 dark:text-red-400 mb-6">
          Error searching albums. Please try again.
        </div>
      )}

      {data?.results && data.results.length === 0 && debouncedQuery && (
        <div className="text-gray-500 dark:text-gray-400 py-12 text-center">
          No albums found matching "{debouncedQuery}"
        </div>
      )}

      {data?.results && data.results.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {data.results.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onScrobble={scrobbleAlbum}
                isScrobbling={Boolean(scrobblingAlbums[album.id])}
                showArtistLink={false}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.pagination && data.pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 mb-12">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-gray-700 dark:text-gray-300">
                Page {currentPage} of {data.pagination.pages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === data.pagination.pages}
                className="p-2 rounded-md border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
