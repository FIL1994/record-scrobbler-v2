import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface ArtistProfileProps {
  profile: string;
}

const MAX_LENGTH = 320;

interface ParsedSegment {
  type: "text" | "url" | "artist" | "release" | "label";
  content: string;
  url?: string;
  id?: string;
}

export function ArtistProfile({ profile }: ArtistProfileProps) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = profile.split("\n\n");
  const firstParagraph = paragraphs[0];
  const hasMoreContent = paragraphs.length > 1;

  const isTooLong = firstParagraph.length > MAX_LENGTH;
  const textToDisplay = expanded
    ? profile
    : isTooLong
      ? `${firstParagraph.substring(0, MAX_LENGTH)}...`
      : firstParagraph;

  const parseProfileText = (text: string): ParsedSegment[] => {
    const segments: ParsedSegment[] = [];
    let currentIndex = 0;

    // Regular expressions for different patterns
    const urlPattern = /\[url=([^\]]+)\]([^\[]+)\[\/url\]/g;
    const artistPattern = /\[a=([^\]]+)\]/g;
    const releasePattern = /\[r=([^\]]+)\]/g;
    const labelPattern = /\[l=([^\]]+)\]/g;

    // Find all matches and their positions
    const matches: Array<{
      type: "url" | "artist" | "release" | "label";
      start: number;
      end: number;
      content: string;
      url?: string;
      id?: string;
    }> = [];

    // Find URL matches
    let urlMatch;
    while ((urlMatch = urlPattern.exec(text)) !== null) {
      matches.push({
        type: "url",
        start: urlMatch.index,
        end: urlMatch.index + urlMatch[0].length,
        content: urlMatch[2],
        url: urlMatch[1],
      });
    }

    // Find artist matches
    let artistMatch;
    while ((artistMatch = artistPattern.exec(text)) !== null) {
      matches.push({
        type: "artist",
        start: artistMatch.index,
        end: artistMatch.index + artistMatch[0].length,
        content: artistMatch[1],
        id: artistMatch[1],
      });
    }

    // Find release matches
    let releaseMatch;
    while ((releaseMatch = releasePattern.exec(text)) !== null) {
      matches.push({
        type: "release",
        start: releaseMatch.index,
        end: releaseMatch.index + releaseMatch[0].length,
        content: "", // Release pattern doesn't include content in the regex
        id: releaseMatch[1],
      });
    }

    // Find label matches
    let labelMatch;
    while ((labelMatch = labelPattern.exec(text)) !== null) {
      matches.push({
        type: "label",
        start: labelMatch.index,
        end: labelMatch.index + labelMatch[0].length,
        content: labelMatch[1],
        id: labelMatch[1],
      });
    }

    // Sort matches by their start position
    matches.sort((a, b) => a.start - b.start);

    // Process text with matches
    for (const match of matches) {
      if (currentIndex < match.start) {
        // Add text before the match
        segments.push({
          type: "text",
          content: text.substring(currentIndex, match.start),
        });
      }

      // Add the match
      segments.push({
        type: match.type,
        content: match.content,
        url: match.url,
        id: match.id,
      });

      currentIndex = match.end;
    }

    // Add any remaining text after the last match
    if (currentIndex < text.length) {
      segments.push({
        type: "text",
        content: text.substring(currentIndex),
      });
    }

    return segments;
  };

  const renderSegment = (segment: ParsedSegment, index: number) => {
    switch (segment.type) {
      case "text":
        return <span key={index}>{segment.content}</span>;

      case "url":
        return (
          <a
            key={index}
            href={segment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {segment.content}
          </a>
        );

      case "artist":
        return (
          <span
            key={index}
            className="font-medium text-gray-800 dark:text-gray-200"
          >
            {segment.content}
          </span>
        );

      case "release":
        return (
          <Link
            key={index}
            to="/release/$id"
            params={{ id: segment.id || "0" }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            [Release {segment.id}]
          </Link>
        );

      case "label":
        return (
          <span
            key={index}
            className="font-medium text-gray-700 dark:text-gray-300"
          >
            {segment.content}
          </span>
        );

      default:
        return null;
    }
  };

  const parsedSegments = parseProfileText(textToDisplay);

  return (
    <div className="text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none">
      <p>
        {parsedSegments.map((segment, index) => renderSegment(segment, index))}
      </p>

      {(hasMoreContent || isTooLong) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp size={16} />
              <span>Show less</span>
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              <span>Show more</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
