import { Share2, Disc, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Album } from "../types";
import { Button } from "./starter-kit/Button";
import { normalizeArtistName } from "../utils/common";
import { ViewTransitionType } from "~/utils/viewTransitions";

interface AlbumCardProps {
  album: Album;
  onScrobble: (album: Album) => void;
  isScrobbling?: boolean;
}

export function AlbumCard({
  album,
  onScrobble,
  isScrobbling = false,
}: AlbumCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900">
      <div className="relative">
        <img
          src={album.coverImage}
          alt={`${album.title} cover`}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-35 transition-opacity duration-300"></div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {album.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {normalizeArtistName(album.artist)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {album.year}
          </p>
        </div>

        <div className="mt-4 flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="destructive"
            onPress={() => onScrobble(album)}
            className="flex-1 flex items-center justify-center gap-2 min-h-[40px] py-0"
            isDisabled={isScrobbling}
          >
            {isScrobbling ? (
              <>
                <Loader2 size={16} className="shrink-0 animate-spin" />
                <span>Scrobbling...</span>
              </>
            ) : (
              <>
                <Share2 size={16} className="shrink-0" />
                <span>Scrobble</span>
              </>
            )}
          </Button>

          <Link
            to="/release/$id"
            params={{ id: album.id.toString() }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 min-h-[40px]"
            viewTransition={{
              types: [ViewTransitionType.SlideUp],
            }}
          >
            <Disc size={16} className="shrink-0" />
            <span>Tracks</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
