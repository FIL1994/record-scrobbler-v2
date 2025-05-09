import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import appCss from "~/styles/app.css?url";
import toastifyCss from "react-toastify/dist/ReactToastify.css?url";
import { seo } from "~/utils/seo";
import { Header } from "~/components/Header";
import { I18nProvider, useLocale } from "react-aria-components";

export const Route = createRootRoute({
  head: (_ctx) => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "Record Scrobbler",
        description:
          "Record Scrobbler is a web application that allows you to scrobble your vinyl record collection to Last.fm. Import your collection from Discogs and start scrobbling.",
        keywords: [
          "Record Scrobbler",
          "Last.fm",
          "Discogs",
          "Scrobble",
          "Vinyl",
          "Scrobble Record",
        ].join(", "),
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: toastifyCss },
      { rel: "icon", href: "/favicon.png" },
    ],
    scripts: import.meta.env.PROD
      ? [
          {
            defer: true,
            src: "https://cloud.umami.is/script.js",
            "data-website-id": import.meta.env.VITE_UMAMI_WEBSITE_ID,
          },
        ]
      : [],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  let { locale, direction } = useLocale();

  return (
    <html lang={locale} dir={direction}>
      <head>
        <HeadContent />
      </head>
      <body>
        <I18nProvider locale={locale}>
          <div className="flex flex-col min-h-screen">
            <Header />

            {children}
          </div>
        </I18nProvider>
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
