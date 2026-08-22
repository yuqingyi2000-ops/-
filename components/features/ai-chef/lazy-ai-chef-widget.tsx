"use client";

import dynamic from "next/dynamic";

const AIChefWidget = dynamic(
  () =>
    import("./ai-chef-widget").then((mod) => mod.AIChefWidget),
  { ssr: false }
);

export function LazyAIChefWidget() {
  return <AIChefWidget />;
}
