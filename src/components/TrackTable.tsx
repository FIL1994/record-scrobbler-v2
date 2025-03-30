import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Row,
  type Table,
  type Header,
  type Cell,
} from "@tanstack/react-table";
import type { DiscogsTrack } from "~/types";

interface TrackTableProps {
  data: DiscogsTrack[];
  selectedTracks: Set<string>;
  onToggleTrack: (position: string) => void;
  onToggleAll: () => void;
}

const columns: ColumnDef<DiscogsTrack>[] = [
  {
    id: "select",
    size: 50,
    header: ({ table }: { table: Table<DiscogsTrack> }) => (
      <div className="flex justify-center">
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
        />
      </div>
    ),
    cell: ({ row }: { row: Row<DiscogsTrack> }) => (
      <div className="flex justify-center">
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
        />
      </div>
    ),
  },
  {
    id: "trackNumber",
    header: "Track",
    size: 60,
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "position",
    header: "#",
    size: 80,
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "duration",
    header: "Duration",
    size: 100,
  },
];

export function TrackTable({
  data,
  selectedTracks,
  onToggleTrack,
  onToggleAll,
}: TrackTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    state: {
      rowSelection: Object.fromEntries(
        data.map((track, index) => [index, selectedTracks.has(track.position)])
      ),
    },
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function"
          ? updater(table.getState().rowSelection)
          : updater;
      const newSelectedTracks = new Set<string>();

      Object.entries(newSelection).forEach(([index, isSelected]) => {
        const position = data[Number(index)].position;
        if (isSelected) {
          newSelectedTracks.add(position);
        }
      });

      // Toggle tracks that were added
      newSelectedTracks.forEach((position) => {
        if (!selectedTracks.has(position)) {
          onToggleTrack(position);
        }
      });

      // Toggle tracks that were removed
      selectedTracks.forEach((position) => {
        if (!newSelectedTracks.has(position)) {
          onToggleTrack(position);
        }
      });

      // Handle select all case
      if (
        newSelectedTracks.size === data.length ||
        newSelectedTracks.size === 0
      ) {
        onToggleAll();
      }
    },
  });

  return (
    <div className="max-h-[600px] overflow-y-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(
                (header: Header<DiscogsTrack, unknown>) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                )
              )}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row: Row<DiscogsTrack>) => (
            <tr
              key={row.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={row.getToggleSelectedHandler()}
            >
              {row
                .getVisibleCells()
                .map((cell: Cell<DiscogsTrack, unknown>) => (
                  <td
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                    className="px-3 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
