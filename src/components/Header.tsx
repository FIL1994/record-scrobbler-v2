import { useQuery } from "@tanstack/react-query";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { Disc3, Music } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { isBrowser } from "~/utils/common";
import { lastfmUserInfoOptions } from "~/utils/queries";

function getLastfmUrl() {
  let url = `http://www.last.fm/api/auth/?api_key=${import.meta.env.VITE_LASTFM_API_KEY}`;

  if (isBrowser()) {
    url += `&cb=${window.location.origin}/auth/lastfm/callback`;
  }
  return url;
}

const navLinks = [
  { path: "/", label: "View Collection" },
  { path: "/scrobble", label: "Scrobble Song" },
] as const;

interface HeaderProps {
  sticky?: boolean;
  hasViewTransition?: boolean;
}

export function Header({
  sticky = true,
  hasViewTransition = false,
}: HeaderProps) {
  const { data: userInfo } = useQuery(lastfmUserInfoOptions());
  const matchRoute = useMatchRoute();

  return (
    <header
      className={twMerge(
        "bg-white shadow-sm dark:bg-gray-900",
        sticky && "sticky top-0 z-10",
        hasViewTransition && "[view-transition-name:header]"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Disc3 className="text-red-600" size={24} />
              <h1 className="text-xl font-bold text-gray-900">
                Record Scrobbler
              </h1>
            </div>

            <nav className="flex items-center space-x-4">
              {navLinks.map((link) => {
                const isActive = matchRoute({
                  to: link.path,
                  fuzzy: link.path === "/",
                });
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          {userInfo ? (
            <a
              href={userInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src={
                  userInfo.image.find((img) => img.size === "large")?.["#text"]
                }
                alt={`${userInfo.name}'s avatar`}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {userInfo.name}
                </span>
                <span className="text-sm text-gray-500">
                  {Number(userInfo.playcount).toLocaleString()} scrobbles
                </span>
              </div>
            </a>
          ) : (
            <a
              href={getLastfmUrl()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = getLastfmUrl();
              }}
            >
              <Music size={16} />
              Sign in with Last.fm
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
