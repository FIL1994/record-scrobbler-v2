import { createFileRoute, redirect } from "@tanstack/react-router";
import { type } from "arktype";

export const Route = createFileRoute("/auth/discogs/callback")({
  // validateSearch: type({
  //   oauth_token: "string?",
  //   oauth_verifier: "string?",
  // }),
  validateSearch: type(
    "Record<string, string | number | boolean | null | undefined>"
  ),
  beforeLoad: ({ search }) => {
    const { oauth_token, oauth_verifier } = search;

    console.log({
      ...search,
      oauth_token,
      oauth_verifier,
    });

    if (!oauth_token || !oauth_verifier) {
      throw new Error("Missing OAuth parameters");
    }

    // TODO: Exchange the oauth token and verifier for an access token
    // Store the access token in localStorage or your preferred storage
    console.log("Discogs OAuth callback received:", {
      oauth_token,
      oauth_verifier,
    });

    // Redirect back to home page after successful auth
    throw redirect({
      to: "/",
      search: true,
    });
  },
});
