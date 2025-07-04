import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { discogsReleaseOptions } from "~/utils/queries";
import {
  mergeProps,
  tooltipStyle,
  useTooltip,
  type TooltipTriggerState,
} from "./tooltipUtils";

interface ReleaseTooltipProps {
  releaseId: string;
  state: TooltipTriggerState;
}

export function ReleaseTooltip({
  releaseId,
  state,
  ...props
}: ReleaseTooltipProps) {
  const { tooltipProps } = useTooltip(props, state);
  const { data: release, isLoading } = useQuery(
    discogsReleaseOptions(Number(releaseId))
  );

  if (isLoading || !release) {
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

  return (
    <div
      className="flex flex-col w-64 overflow-hidden"
      style={tooltipStyle}
      {...mergeProps(props, tooltipProps)}
    >
      {release.images?.[0]?.uri && (
        <div className="relative w-full h-32 overflow-hidden bg-gray-100">
          <img
            src={release.images[0].uri}
            alt={release.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 truncate">{release.title}</h3>
        {release.artists?.[0]?.name && (
          <p className="text-sm text-gray-600 truncate">
            {release.artists[0].name}
          </p>
        )}
        {release.year && (
          <p className="text-xs text-gray-500 mt-1">{release.year}</p>
        )}
      </div>
    </div>
  );
}
