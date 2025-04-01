import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { normalizeArtistName } from "~/utils/common";
import { discogsArtistOptions } from "~/utils/queries";
import {
  mergeProps,
  tooltipStyle,
  useTooltip,
  type TooltipTriggerState,
} from "./tooltipUtils";

interface ArtistTooltipProps {
  artistId: string;
  state: TooltipTriggerState;
}

export function ArtistTooltip({
  artistId,
  state,
  ...props
}: ArtistTooltipProps) {
  const { tooltipProps } = useTooltip(props, state);
  const { data: artist, isLoading } = useQuery({
    ...discogsArtistOptions(Number(artistId)),
  });

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center p-4"
        style={tooltipStyle}
        {...mergeProps(props, tooltipProps)}
      >
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!artist) {
    return null;
  }

  const artistName = normalizeArtistName(artist.name);

  return (
    <div
      className="flex flex-col w-64 overflow-hidden"
      style={tooltipStyle}
      {...mergeProps(props, tooltipProps)}
    >
      {artist.images?.[0]?.uri && (
        <div className="relative w-full h-32 overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={artist.images[0].uri}
            alt={artistName}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
          {artistName}
        </h3>
        {artist.profile && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
            {artist.profile.split("\n")[0]}
          </p>
        )}
      </div>
    </div>
  );
}
