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
import { PageTransition } from "@/components/ui/page-transition/page-transition";
import { ServiceWorkerUpdateHandler } from "@/components/ui/service-worker-update-handler/service-worker-update-handler";
import { LazyAIChefWidget } from "@/components/features/ai-chef/lazy-ai-chef-widget";

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
  title: "The Recipe Room",
  description: "A vintage-style recipe collection app",
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
      lang="en"
      className={`${playfair.variable} ${crimson.variable} ${cormorant.variable} ${ebGaramond.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#7c021d" />
        <title>The Recipe Room</title>
      </head>
      <body suppressHydrationWarning={true}>
        <ReactQueryProvider>
          <AuthProvider>
            {process.env.NODE_ENV === "development" && <ExposeSupabase />}
            <PageTransition>
              <main>{children}</main>
            </PageTransition>
            <LazyAIChefWidget />
            <ServiceWorkerUpdateHandler />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
