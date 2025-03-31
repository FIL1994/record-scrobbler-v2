import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { scrobbleTracks } from "~/services/lastfm";
import { LocalStorageKeys } from "~/utils/localStorageKeys";
import { seo } from "~/utils/seo";
import { ScrobbleForm } from "~/components/scrobble/ScrobbleForm";
import { ScrobbleHistory } from "~/components/scrobble/ScrobbleHistory";
import type { ScrobbleFormData } from "~/components/scrobble/ScrobbleForm";

export const Route = createFileRoute("/scrobble")({
  component: RouteComponent,
  head: (_ctx) => ({
    meta: [
      ...seo({
        title: "Manual Scrobble - Record Scrobbler",
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
  const { scrobbleHistory, addToHistory, removeFromHistory } =
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

        <ScrobbleHistory
          items={scrobbleHistory}
          onItemClick={handleHistoryItemClick}
          onItemDelete={handleHistoryItemDelete}
        />
      </div>
    </div>
  );
}

function useScrobbleHistory() {
  const [scrobbleHistory, setScrobbleHistory] = useState<ScrobbleHistoryItem[]>(
    []
  );

  useEffect(() => {
    const savedHistory = localStorage.getItem(LocalStorageKeys.ScrobbleHistory);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory) as ScrobbleHistoryItem[];
        setScrobbleHistory(parsedHistory);
      } catch (error) {
        console.error("Error parsing scrobble history:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      LocalStorageKeys.ScrobbleHistory,
      JSON.stringify(scrobbleHistory)
    );
  }, [scrobbleHistory]);

  function addToHistory(item: Omit<ScrobbleHistoryItem, "id" | "timestamp">) {
    const newHistoryItem: ScrobbleHistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    setScrobbleHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]);
    return newHistoryItem;
  }

  function removeFromHistory(id: string) {
    setScrobbleHistory((prev) => prev.filter((item) => item.id !== id));
  }

  return {
    scrobbleHistory,
    addToHistory,
    removeFromHistory,
  };
}
