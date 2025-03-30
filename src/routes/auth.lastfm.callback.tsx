import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getSession } from "~/services/lastfm";
import { type } from "arktype";
import { LocalStorageKeys } from "~/utils/localStorageKeys";

export const Route = createFileRoute("/auth/lastfm/callback")({
  component: LastfmCallback,
  validateSearch: type(
    "Record<string, string | number | boolean | null | undefined>"
  ),
});

function LastfmCallback() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();

  useEffect(() => {
    const exchangeToken = async () => {
      try {
        if (!token || typeof token !== "string") {
          throw new Error("Missing or invalid token parameter");
        }

        const sessionKey = await getSession(token);
        localStorage.setItem(LocalStorageKeys.SessionToken, sessionKey);
        navigate({ to: "/", replace: true });
      } catch (error) {
        console.error("Failed to exchange token:", error);
        navigate({ to: "/", replace: true });
      }
    };

    exchangeToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
        <p className="text-gray-600">Connecting to Last.fm...</p>
      </div>
    </div>
  );
}
