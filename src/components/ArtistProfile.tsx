import { useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ArtistTooltip } from "~/components/tooltips/ArtistTooltip";
import { ReleaseTooltip } from "~/components/tooltips/ReleaseTooltip";
import { useTooltipTriggerState } from "react-stately";
import { useTooltipTrigger } from "react-aria";
import { useQueryClient } from "@tanstack/react-query";
import { discogsArtistOptions, discogsReleaseOptions } from "~/utils/queries";
import { normalizeArtistName } from "~/utils/common";
import { defaultTooltipState } from "./tooltips/tooltipUtils";

interface ArtistProfileProps {
  profile: string;
}

const MAX_PROFILE_LENGTH = 320;

interface ParsedSegment {
  type: "text" | "url" | "artist" | "release" | "label" | "italic" | "timespan";
  content: string;
  url?: string;
  id?: string;
}

export function ArtistProfile({ profile }: ArtistProfileProps) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = profile.split("\n\n");
  const firstParagraph = paragraphs[0];
  const hasMoreContent = paragraphs.length > 1;

  const isTooLong = firstParagraph.length > MAX_PROFILE_LENGTH;
  const textToDisplay = expanded
    ? profile
    : isTooLong
      ? `${firstParagraph.substring(0, MAX_PROFILE_LENGTH)}...`
      : firstParagraph;

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
        // Check if it's a numeric ID (from [a123456] format)
        const isNumericId = /^Artist \d+$/.test(segment.content);

        if (isNumericId) {
          return (
            <ArtistLink
              key={index}
              id={segment.id!}
              content={segment.content}
            />
          );
        } else {
          return (
            <span
              key={index}
              className="font-medium text-gray-800 dark:text-gray-200"
            >
              {segment.content}
            </span>
          );
        }

      case "label":
        return (
          <span
            key={index}
            className="font-medium text-gray-700 dark:text-gray-300"
          >
            {segment.content}
          </span>
        );

      case "release":
        return <ReleaseLink key={index} id={segment.id!} />;

      case "italic":
        return (
          <em key={index} className="">
            {segment.content}:
          </em>
        );

      case "timespan":
        return (
          <span key={index} className="text-gray-600 dark:text-gray-400">
            {segment.content}
          </span>
        );

      default:
        return null;
    }
  };

  const parsedSegments = useMemo(
    () => parseProfileText(textToDisplay),
    [textToDisplay]
  );

  return (
    <div className="text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none">
      <article>
        {parsedSegments.map((segment, index) => renderSegment(segment, index))}
      </article>

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

function parseProfileText(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let currentIndex = 0;

  // Regular expressions for different patterns
  const urlPattern = /\[url=([^\]]+)\]([^\[]+)\[\/url\]/g;
  const artistPattern = /\[a=([^\]]+)\]/g;
  const artistIdPattern = /\[a(\d+)\]/g;
  const releasePattern = /\[r=([^\]]+)\]/g;
  const labelPattern = /\[l=([^\]]+)\]/g;
  const italicPattern = /\[i\]([^\[]+)\[\/i\]/g;
  const timespanPattern = /\[u\]([^\[]+)\[\/u\]/g;

  // Find all matches and their positions
  const matches: Array<{
    type: "url" | "artist" | "release" | "label" | "italic" | "timespan";
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

  // Find artist ID matches [a123456]
  let artistIdMatch;
  while ((artistIdMatch = artistIdPattern.exec(text)) !== null) {
    matches.push({
      type: "artist",
      start: artistIdMatch.index,
      end: artistIdMatch.index + artistIdMatch[0].length,
      content: `Artist ${artistIdMatch[1]}`,
      id: artistIdMatch[1],
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

  // Find italic text matches
  let italicMatch;
  while ((italicMatch = italicPattern.exec(text)) !== null) {
    matches.push({
      type: "italic",
      start: italicMatch.index,
      end: italicMatch.index + italicMatch[0].length,
      content: italicMatch[1],
    });
  }

  // Find timespan matches
  let timespanMatch;
  while ((timespanMatch = timespanPattern.exec(text)) !== null) {
    matches.push({
      type: "timespan",
      start: timespanMatch.index,
      end: timespanMatch.index + timespanMatch[0].length,
      content: timespanMatch[1],
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
}

function ReleaseLink({ id, ...props }: { id: string }) {
  const state = useTooltipTriggerState({
    ...props,
    ...defaultTooltipState,
  });
  const ref = useRef(null);
  const { triggerProps, tooltipProps } = useTooltipTrigger(props, state, ref);
  const queryClient = useQueryClient();

  const releaseId = Number(id);
  const queryKey = discogsReleaseOptions(releaseId).queryKey;
  const cachedData = queryClient.getQueryData(queryKey);

  const displayText = cachedData ? cachedData.title : `Release ${id}`;

  return (
    <span className="relative">
      <Link
        ref={ref}
        {...triggerProps}
        to="/release/$id"
        params={{ id: id || "0" }}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {displayText}
      </Link>

      {state.isOpen && (
        <span {...tooltipProps}>
          <ReleaseTooltip releaseId={id} state={state} {...tooltipProps} />
        </span>
      )}
    </span>
  );
}

function ArtistLink({
  id,
  content,
  ...props
}: {
  id: string;
  content: string;
}) {
  const state = useTooltipTriggerState({
    ...props,
    ...defaultTooltipState,
  });
  const ref = useRef(null);
  const { triggerProps, tooltipProps } = useTooltipTrigger(props, state, ref);
  const queryClient = useQueryClient();

  const artistId = Number(id);
  const queryKey = discogsArtistOptions(artistId).queryKey;
  const cachedData = queryClient.getQueryData(queryKey);

  const displayText = cachedData
    ? normalizeArtistName(cachedData.name)
    : content;

  return (
    <span className="relative">
      <Link
        ref={ref}
        {...triggerProps}
        to="/artist/$id"
        params={{ id: id || "0" }}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {displayText}
      </Link>

      {state.isOpen && (
        <span {...tooltipProps}>
          <ArtistTooltip artistId={id} state={state} {...tooltipProps} />
        </span>
      )}
    </span>
  );
}
