import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { scrobbleTracks } from "~/services/lastfm";
import { LocalStorageKeys } from "~/utils/localStorageKeys";
import { seo } from "~/utils/seo";
import { ScrobbleForm } from "~/components/scrobble/ScrobbleForm";
import { ScrobbleHistory } from "~/components/scrobble/ScrobbleHistory";
import type { ScrobbleFormData } from "~/components/scrobble/ScrobbleForm";

export const Route = createFileRoute("/manual")({
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
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
    setScrobbleHistory((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
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

      await scrobbleTracks({
        artist: formData.artist,
        tracks: [formData.track],
        token,
        album: formData.album || undefined,
      });

      const newHistoryItem: ScrobbleHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        artist: formData.artist,
        track: formData.track,
        album: formData.album,
      };

      setScrobbleHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]);

      setMessage({ text: "Track scrobbled successfully!", type: "success" });

      // Reset form
      setFormData({
        artist: "",
        track: "",
        album: "",
      });
    } catch (error) {
      console.error("Error scrobbling track:", error);
      setMessage({
        text:
          error instanceof Error ? error.message : "Failed to scrobble track",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manually Scrobble a Track</h1>

      {message && (
        <div
          className={`p-4 mb-6 rounded-md ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-20">
        <ScrobbleForm
          formData={formData}
          isSubmitting={isSubmitting}
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
