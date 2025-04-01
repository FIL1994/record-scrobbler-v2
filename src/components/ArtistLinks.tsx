import { ExternalLink, Guitar } from "lucide-react";
import {
  SiFacebook,
  SiX,
  SiInstagram,
  SiYoutube,
  SiSpotify,
  SiBandcamp,
  SiSoundcloud,
  SiDiscogs,
  SiWikipedia,
  SiMyspace,
  SiLinktree,
  SiImdb,
} from "@icons-pack/react-simple-icons";

interface ArtistLinksProps {
  urls: string[];
}

interface ParsedLink {
  url: string;
  icon: React.ReactNode;
  name: string;
}

export function ArtistLinks({ urls }: ArtistLinksProps) {
  if (!urls || urls.length === 0) {
    return null;
  }

  const parseLinks = (urls: string[]): ParsedLink[] => {
    return urls.map((url) => {
      const hostname = new URL(url).hostname.toLowerCase();

      if (hostname.includes("facebook.com")) {
        return { url, icon: <SiFacebook size={16} />, name: "Facebook" };
      } else if (
        hostname.includes("twitter.com") ||
        hostname.includes("x.com")
      ) {
        return { url, icon: <SiX size={16} />, name: "Twitter" };
      } else if (hostname.includes("instagram.com")) {
        return { url, icon: <SiInstagram size={16} />, name: "Instagram" };
      } else if (hostname.includes("youtube.com")) {
        return { url, icon: <SiYoutube size={16} />, name: "YouTube" };
      } else if (hostname.includes("spotify.com")) {
        return { url, icon: <SiSpotify size={16} />, name: "Spotify" };
      } else if (hostname.includes("bandcamp.com")) {
        return { url, icon: <SiBandcamp size={16} />, name: "Bandcamp" };
      } else if (hostname.includes("soundcloud.com")) {
        return { url, icon: <SiSoundcloud size={16} />, name: "SoundCloud" };
      } else if (hostname.includes("discogs.com")) {
        return { url, icon: <SiDiscogs size={16} />, name: "Discogs" };
      } else if (hostname.includes("wikipedia.org")) {
        return { url, icon: <SiWikipedia size={16} />, name: "Wikipedia" };
      } else if (hostname.includes("myspace.com")) {
        return { url, icon: <SiMyspace size={16} />, name: "Myspace" };
      } else if (hostname.includes("imdb.com")) {
        return { url, icon: <SiImdb size={16} />, name: "IMDb" };
      } else if (hostname.includes("linktr.ee")) {
        return { url, icon: <SiLinktree size={16} />, name: "Linktree" };
      } else if (hostname.includes("equipboard.com")) {
        return { url, icon: <Guitar size={16} />, name: "Equipboard" };
      } else {
        return {
          url,
          icon: <ExternalLink size={16} />,
          name: hostname.replace("www.", ""),
        };
      }
    });
  };

  const parsedLinks = parseLinks(urls);

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
        Links
      </h3>
      <div className="flex flex-wrap gap-3">
        {parsedLinks.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={link.name}
          >
            {link.icon}
            <span>{link.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
