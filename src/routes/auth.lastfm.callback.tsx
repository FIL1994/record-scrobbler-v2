import { createFileRoute, redirect } from "@tanstack/react-router";
import { type } from "arktype";

export const Route = createFileRoute("/auth/lastfm/callback")({
  validateSearch: type(
    "Record<string, string | number | boolean | null | undefined>",
  ),
  beforeLoad: ({ search }) => {
    const { token } = search;

    console.log({
      ...search,
      token,
    });

    if (!token) {
      throw new Error("Missing token parameter");
    }

    // TODO: Exchange the token for a session key
    // Store the session key in localStorage or your preferred storage
    console.log("Last.fm OAuth callback received:", { token });

    // Redirect back to home page after successful auth
    throw redirect({
      to: "/",
      search: true,
    });
  },
});
