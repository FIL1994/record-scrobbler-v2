import { useQuery } from "@tanstack/react-query";
import { Music } from "lucide-react";
import { lastfmUserInfoOptions } from "~/utils/queries";

function getLastfmUrl() {
  let url = `http://www.last.fm/api/auth/?api_key=${import.meta.env.VITE_LASTFM_API_KEY}`;

  if (typeof window !== "undefined") {
    url += `&cb=${window.location.origin}/auth/lastfm/callback`;
  }
  return url;
}

export function Header() {
  const { data: userInfo } = useQuery(lastfmUserInfoOptions());

  console.log({ userInfo });

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="text-red-600" size={24} />
            <h1 className="text-xl font-bold text-gray-900">
              Vinyl Collection Manager
            </h1>
          </div>
          <a
            href={getLastfmUrl()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Music size={16} />
            Sign in with Last.fm
          </a>
        </div>
      </div>
    </header>
  );
}
