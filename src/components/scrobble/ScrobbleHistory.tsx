import { ScrobbleHistoryItem } from "./ScrobbleHistoryItem";
import type { ScrobbleHistoryItemProps } from "./ScrobbleHistoryItem";

export interface ScrobbleHistoryProps {
  items: Omit<ScrobbleHistoryItemProps, "onClick" | "onDelete">[];
  onItemClick: (
    item: Omit<ScrobbleHistoryItemProps, "onClick" | "onDelete">
  ) => void;
  onItemDelete: (id: string) => void;
}

export function ScrobbleHistory({
  items,
  onItemClick,
  onItemDelete,
}: ScrobbleHistoryProps) {
  return (
    <div className="flex-1 mt-8 md:mt-0">
      <h2 className="text-xl font-semibold mb-4">Recent Scrobbles</h2>
      {items.length === 0 ? (
        <p className="text-gray-500">No scrobble history yet</p>
      ) : (
        <ul className="space-y-2 max-h-[500px] overflow-y-auto">
          {items.map((item) => (
            <ScrobbleHistoryItem
              key={item.id}
              {...item}
              onClick={() => onItemClick(item)}
              onDelete={onItemDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
