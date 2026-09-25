import type React from "react";
import type { Metadata } from "next";
import {
  Playfair_Display,
  Crimson_Text,
  Cormorant_Garamond,
  EB_Garamond,
} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";
import { ExposeSupabase } from "@/components/dev/ExposeSupabase";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { LumenProvider } from "@/components/providers/LumenProvider";
import { PageTransition } from "@/components/ui/page-transition/page-transition";
import { ServiceWorkerUpdateHandler } from "@/components/ui/service-worker-update-handler/service-worker-update-handler";
import { OverlayScrollLock } from "@/components/providers/overlay-scroll-lock";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-crimson",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-eb-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  title: "饭饭簿",
  description: "和喜欢的人一起收藏每一顿好好吃饭的日子",
  icons: {
    icon: "/favrecipebox.webp",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${playfair.variable} ${crimson.variable} ${cormorant.variable} ${ebGaramond.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#748b76" />
        <title>饭饭簿</title>
      </head>
      <body suppressHydrationWarning={true}>
        <ReactQueryProvider>
          <LumenProvider>
            <AuthProvider>
              {process.env.NODE_ENV === "development" && <ExposeSupabase />}
              <PageTransition>
                <main>{children}</main>
              </PageTransition>
              <OverlayScrollLock />
              <ServiceWorkerUpdateHandler />
            </AuthProvider>
          </LumenProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
