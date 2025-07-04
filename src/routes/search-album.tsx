import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageContainer } from "~/components/PageContainer";
import { MasterAlbumCard } from "~/components/MasterAlbumCard";
import { Pagination } from "~/components/Pagination";
import { discogsSearchOptions } from "~/utils/queries";
import { useDebouncedValue } from "~/hooks/useDebouncedValue";

export const Route = createFileRoute("/search-album")({
  component: SearchAlbum,
});

function SearchAlbum() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);

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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Albums</h1>

      <div className="mb-8">
        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            autoFocus
            name="album-search"
            autoComplete="on"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search for an album..."
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {(isLoading || !data) && searchQuery && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500" />
        </div>
      )}

      {isError && (
        <div className="text-red-500 mb-6">
          Error searching albums. Please try again.
        </div>
      )}

      {data?.results && data.results.length === 0 && debouncedQuery && (
        <div className="text-gray-500 py-12 text-center">
          No albums found matching "{debouncedQuery}"
        </div>
      )}

      {data?.results && data.results.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {data.results.map((album) => (
              <MasterAlbumCard key={album.id} album={album} />
            ))}
          </div>

          {/* Pagination */}
          {data.pagination && data.pagination.pages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={data.pagination.pages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </PageContainer>
  );
}
