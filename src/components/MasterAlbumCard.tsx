import { Disc, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Album } from "../types";
import { normalizeArtistName } from "../utils/common";
import { ViewTransitionType } from "~/utils/viewTransitions";
import { discogsMasterOptions } from "~/utils/queries";

interface MasterAlbumCardProps {
  album: Album;
}

export function MasterAlbumCard({ album }: MasterAlbumCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const artistName = normalizeArtistName(album.artist);

  const { data: masterData, isLoading } = useQuery(
    discogsMasterOptions(album.id, { enabled: isHovering })
  );

  // Prefetch on hover
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 transition-all duration-300 hover:shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative">
        {album.coverImage ? (
          <img
            src={album.coverImage}
            alt={`${album.title} cover`}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Disc className="h-20 w-20 text-gray-400 dark:text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-35 transition-opacity duration-300"></div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {album.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{artistName}</p>
          {!!album.year && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {album.year}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span>Loading release...</span>
            </div>
          ) : masterData?.main_release ? (
            <Link
              to="/release/$id"
              params={{ id: masterData.main_release.toString() }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 min-h-[40px] w-full"
              viewTransition={{
                types: [ViewTransitionType.SlideUp],
              }}
            >
              <ExternalLink size={16} className="shrink-0" />
              <span>View Release</span>
            </Link>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Hover to load release details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
