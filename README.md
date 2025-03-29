# record-scrobbler-v2

A web app to scrobble your Discogs collection to Last.fm.

## Setup

Copy `.env.example` to `.env` and fill in the required values.

```bash
cp .env.example .env
```

## Run

```bash
bun run dev
```

## Callback URLs

### Discogs

`http://localhost:3000/auth/discogs/callback`

### Last.fm

`http://localhost:3000/auth/lastfm/callback`
