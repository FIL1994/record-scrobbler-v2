import { Share2, Disc } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Album } from "../types";

interface AlbumCardProps {
  album: Album;
  onScrobble: (album: Album) => void;
}

export function AlbumCard({ album, onScrobble }: AlbumCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={album.coverImage}
        alt={`${album.title} cover`}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{album.title}</h3>
        <p className="text-gray-600">{album.artist}</p>
        <p className="text-sm text-gray-500">{album.year}</p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onScrobble(album)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Share2 size={16} />
            Scrobble
          </button>

          <Link
            to="/release/$id"
            params={{ id: album.id.toString() }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Disc size={16} />
            Tracks
          </Link>
        </div>
      </div>
    </div>
  );
}
