import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { scrobbleTracks } from "~/services/lastfm";
import { LocalStorageKeys } from "~/utils/localStorageKeys";
import { seo } from "~/utils/seo";
import { compressData, decompressData } from "~/utils/compression";
import { ScrobbleForm } from "~/components/scrobble/ScrobbleForm";
import { ScrobbleHistoryItem } from "~/components/scrobble/ScrobbleHistoryItem";
import type { ScrobbleFormData } from "~/components/scrobble/ScrobbleForm";

const MAX_HISTORY_SIZE = 20;

export const Route = createFileRoute("/scrobble")({
  component: RouteComponent,
  head: (_ctx) => ({
    meta: [
      ...seo({
        title: "Scrobble Song - Record Scrobbler",
      }),
    ],
  }),
});

interface ScrobbleHistoryItem extends ScrobbleFormData {
  id: string;
  timestamp: number;
}

function RouteComponent() {
  const [formData, setFormData] = useState<ScrobbleFormData>({
    artist: "",
    track: "",
    album: "",
  });
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const { scrobbleHistory, addToHistory, removeFromHistory, isLoading } =
    useScrobbleHistory();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleHistoryItemClick(item: ScrobbleHistoryItem) {
    setFormData({
      artist: item.artist,
      track: item.track,
      album: item.album || "",
    });
  }

  function handleHistoryItemDelete(id: string) {
    removeFromHistory(id);
  }

  const scrobbleMutation = useMutation({
    mutationFn: async (data: {
      artist: string;
      track: string;
      album?: string;
      token: string;
    }) => {
      return scrobbleTracks({
        artist: data.artist,
        tracks: [data.track],
        token: data.token,
        album: data.album,
      });
    },
    onSuccess: () => {
      addToHistory({
        artist: formData.artist,
        track: formData.track,
        album: formData.album,
      });
      setMessage({ text: "Track scrobbled successfully!", type: "success" });

      // Reset form
      setFormData({
        artist: "",
        track: "",
        album: "",
      });
    },
    onError: (error: unknown) => {
      console.error("Error scrobbling track:", error);
      setMessage({
        text:
          error instanceof Error ? error.message : "Failed to scrobble track",
        type: "error",
      });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const token = localStorage.getItem(LocalStorageKeys.SessionToken);

    if (!token) {
      setMessage({
        text: "Please authenticate with Last.fm first",
        type: "error",
      });
      return;
    }

    if (!formData.artist || !formData.track) {
      setMessage({ text: "Artist and track are required", type: "error" });
      return;
    }

    scrobbleMutation.mutate({
      artist: formData.artist,
      track: formData.track,
      album: formData.album || undefined,
      token,
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manually Scrobble a Track</h1>

      {message && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 mb-6 rounded-md ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-20">
        <ScrobbleForm
          formData={formData}
          isSubmitting={scrobbleMutation.isPending}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />

        <div className="flex-1 mt-8 md:mt-0">
          <h2 className="text-xl font-semibold mb-4">Recent Scrobbles</h2>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              <p className="mt-2 text-gray-500">Loading history...</p>
            </div>
          ) : scrobbleHistory.length === 0 ? (
            <p className="text-gray-500">No scrobble history yet</p>
          ) : (
            <ul className="space-y-2 max-h-[500px] overflow-y-auto">
              {scrobbleHistory.map((item) => (
                <ScrobbleHistoryItem
                  key={item.id}
                  {...item}
                  onClick={() => handleHistoryItemClick(item)}
                  onDelete={handleHistoryItemDelete}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function useScrobbleHistory() {
  const [scrobbleHistory, setScrobbleHistory] = useState<ScrobbleHistoryItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      try {
        const compressedHistory = localStorage.getItem(
          LocalStorageKeys.ScrobbleHistory
        );

        if (compressedHistory) {
          const decompressedData = await decompressData(compressedHistory);
          const historyData = JSON.parse(decompressedData);
          setScrobbleHistory(historyData);
        }
      } catch (error) {
        console.error("Error loading scrobble history:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, []);

  useEffect(() => {
    async function saveHistory() {
      if (scrobbleHistory.length > 0) {
        try {
          const historyString = JSON.stringify(scrobbleHistory);
          const compressedData = await compressData(historyString);

          // compareDataSizes(historyString, compressedData);

          localStorage.setItem(
            LocalStorageKeys.ScrobbleHistory,
            compressedData
          );
        } catch (error) {
          console.error("Error saving scrobble history:", error);
        }
      } else {
        localStorage.removeItem(LocalStorageKeys.ScrobbleHistory);
      }
    }

    saveHistory();
  }, [scrobbleHistory]);

  function addToHistory(item: Omit<ScrobbleHistoryItem, "id" | "timestamp">) {
    const newHistoryItem: ScrobbleHistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    setScrobbleHistory((prev) => {
      const isDuplicate = (historyItem: ScrobbleHistoryItem) =>
        historyItem.artist.toLowerCase() === item.artist.toLowerCase() &&
        historyItem.track.toLowerCase() === item.track.toLowerCase() &&
        historyItem.album?.toLowerCase() === item.album?.toLowerCase();

      const filteredHistory = prev.filter(
        (historyItem) => !isDuplicate(historyItem)
      );

      return [
        newHistoryItem,
        ...filteredHistory.slice(0, MAX_HISTORY_SIZE - 1),
      ];
    });

    return newHistoryItem;
  }

  function removeFromHistory(id: string) {
    setScrobbleHistory((prev) => prev.filter((item) => item.id !== id));
  }

  return {
    scrobbleHistory,
    addToHistory,
    removeFromHistory,
    isLoading,
  };
}
