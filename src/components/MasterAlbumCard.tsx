import { Disc, Loader2 } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Album, DiscogsMasterRelease } from "../types";
import { normalizeArtistName } from "../utils/common";
import { ViewTransitionType } from "~/utils/viewTransitions";
import { discogsMasterOptions } from "~/utils/queries";
import { getMasterRelease } from "~/services/discogs";
import { twMerge } from "tailwind-merge";

interface MasterAlbumCardProps {
  album: Album;
}

const cardClassName =
  "bg-white text-left rounded-lg shadow-md overflow-hidden flex flex-col h-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 transition-all duration-300 hover:shadow-lg cursor-pointer";

export function MasterAlbumCard({ album }: MasterAlbumCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const artistName = normalizeArtistName(album.artist);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: masterData } = useQuery(
    discogsMasterOptions(album.id, { enabled: isHovering })
  );

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleClick = async (e: React.MouseEvent) => {
    if (!masterData?.main_release) {
      e.preventDefault();

      try {
        const data = await queryClient.fetchQuery({
          queryKey: ["discogs", "master", album.id],
          queryFn: () => getMasterRelease(album.id),
          staleTime: Infinity,
        });

        if (data?.main_release) {
          navigate({
            to: "/release/$id",
            params: { id: data.main_release.toString() },
          });
        }
      } catch (error) {
        console.error("Error fetching master release:", error);
      }
    }
  };

  const CardContent = (
    <div className="w-full h-full">
      <div className="relative">
        {album.coverImage ? (
          <img
            src={album.coverImage}
            alt={`${album.title} cover`}
            className="w-full h-48 object-cover"
            loading="eager"
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
      </div>
    </div>
  );

  return (
    <Link
      to={masterData ? "/release/$id" : ("#" as string)}
      params={{ id: masterData?.main_release.toString() }}
      className={cardClassName}
      viewTransition={{ types: [ViewTransitionType.SlideUp] }}
      onClick={masterData ? undefined : handleClick}
    >
      {CardContent}
    </Link>
  );
}
