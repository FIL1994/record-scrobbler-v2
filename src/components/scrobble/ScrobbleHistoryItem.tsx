import { Disc, Trash2 } from "lucide-react";
import { useButton } from "react-aria";
import { useRef } from "react";

export interface ScrobbleHistoryItemProps {
  id: string;
  artist: string;
  track: string;
  album?: string;
  timestamp: number;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export function ScrobbleHistoryItem({
  id,
  track,
  artist,
  album,
  timestamp,
  onClick,
  onDelete,
}: ScrobbleHistoryItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { buttonProps } = useButton({ onPress: onClick }, ref);

  return (
    <li className="relative p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors">
      <DeleteIconButton
        onPress={() => onDelete(id)}
        aria-label="Delete scrobble"
        title="Delete scrobble"
      />
      <div
        ref={ref}
        {...buttonProps}
        className="cursor-pointer flex gap-2.5 items-start justify-start"
      >
        <Disc className="size-8 mt-1 text-gray-500" />
        <div>
          <div className="font-medium">{track}</div>
          <div className="text-sm text-gray-600">{artist}</div>
          {album && <div className="text-xs text-gray-500">{album}</div>}
          <div className="text-xs text-gray-400 mt-1">
            {new Date(timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    </li>
  );
}

interface DeleteIconButtonProps {
  onPress: () => void;
  "aria-label": string;
  title?: string;
}

function DeleteIconButton({ title, ...props }: DeleteIconButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps } = useButton({ ...props, type: "button" }, ref);

  return (
    <button
      ref={ref}
      {...buttonProps}
      title={title}
      className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
    >
      <Trash2 className="h-4 w-4 text-red-500" />
    </button>
  );
}
