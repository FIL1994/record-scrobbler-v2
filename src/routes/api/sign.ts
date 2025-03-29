import { createAPIFileRoute } from "@tanstack/react-start/api";
import { json } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";

// used for signing Last.fm API calls

export const APIRoute = createAPIFileRoute("/api/sign")({
  GET: async ({ request }) => {
    setResponseStatus(200);
    return new Response("Hello, World! from " + request.url);
  },
  POST: async ({ request }) => {
    return json({
      message: "Hello, World! from " + request.url,
    });
  },
});
