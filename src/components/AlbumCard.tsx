import { Share2 } from "lucide-react";
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

        <button
          type="button"
          onClick={() => onScrobble(album)}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <Share2 size={16} />
          Scrobble to Last.fm
        </button>
      </div>
    </div>
  );
}
