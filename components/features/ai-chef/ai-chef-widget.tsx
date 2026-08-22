"use client";

import React, { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AIChefButton } from "./ai-chef-button/ai-chef-button";
import { lottieCache } from "@/lib/lottie-cache";

const AIChefChatWindow = dynamic(
  () =>
    import("./ai-chef-chat-window/ai-chef-chat-window").then(
      (mod) => mod.AIChefChatWindow
    ),
  { ssr: false }
);

const DEFAULT_ANIMATION_PATH =
  "/assets/lottie/Animation - 1751255045745.json";

export function AIChefWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lottiePreloadedRef = useRef(false);

  const preloadChatAssets = useCallback(() => {
    if (lottiePreloadedRef.current) return;
    lottiePreloadedRef.current = true;
    lottieCache.preloadAnimation(DEFAULT_ANIMATION_PATH).catch(console.error);
  }, []);

  const handleAIChefClick = useCallback(() => {
    preloadChatAssets();
    setIsChatOpen((open) => !open);
  }, [preloadChatAssets]);

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  return (
    <>
      <AIChefButton ref={buttonRef} onClick={handleAIChefClick} />
      {isChatOpen && (
        <>
          <div
            className="ai-chef-overlay"
            onClick={handleCloseChat}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              backdropFilter: "blur(2px)",
              zIndex: 999,
              animation: "fadeIn 0.2s ease-out",
            }}
          />
          <AIChefChatWindow onClose={handleCloseChat} buttonRef={buttonRef} />
        </>
      )}
    </>
  );
}
