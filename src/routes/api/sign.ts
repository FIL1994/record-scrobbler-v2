import { createAPIFileRoute } from "@tanstack/react-start/api";
import { json } from "@tanstack/react-start";
import { createHash } from "node:crypto";
import { type } from "arktype";

const API_SECRET = import.meta.env.VITE_LASTFM_SECRET;

const paramsType = type({
  ["token?"]: "string > 0",
  api_key: "string == 32",
  method: "string > 0",
  format: "never?",
  ["sk?"]: "string > 0",
  // only for scrobble params
  ["artist?"]: "string > 0",
  ["track?"]: "string > 0",
  ["timestamp?"]: "string > 0",
  ["album?"]: "string > 0",
});

// see https://www.last.fm/api/webauth#_6-sign-your-calls
export const APIRoute = createAPIFileRoute("/api/sign")({
  POST: async ({ request }) => {
    if (!API_SECRET) {
      throw new Error("Last.fm API secret is not configured");
    }

    const rawParams = await request.json();
    const params = paramsType(rawParams);

    if (params instanceof type.errors) {
      return json(
        { error: `Invalid parameters: ${params.summary}` },
        { status: 400 } // BadRequest
      );
    }

    // 1. Sort parameters alphabetically
    const sortedParams = Object.entries(params).sort(([a], [b]) =>
      a.localeCompare(b, "en-US")
    );

    // 2. Concatenate parameters in name+value format
    const paramString = sortedParams.reduce((acc, [key, value]) => {
      return acc + key + value;
    }, "");

    // 3. Append secret and generate MD5 hash
    const signature = createHash("md5")
      .update(paramString + API_SECRET)
      .digest("hex");

    return json({ signature });
  },
});
