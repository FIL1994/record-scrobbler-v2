# record-scrobbler-v2

[![Netlify Status](https://api.netlify.com/api/v1/badges/db880898-6a4b-4769-a68d-1062535597c7/deploy-status)](https://app.netlify.com/sites/record-scrobbler/deploys)

A web app to scrobble your Discogs collection to Last.fm.

## Analytics

This web app uses [Umami](https://us.umami.is/dashboard) for analytics.

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
