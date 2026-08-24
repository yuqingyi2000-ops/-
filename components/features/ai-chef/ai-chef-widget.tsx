"use client";

import React, { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AIChefButton } from "./ai-chef-button/ai-chef-button";

const AIChefChatWindow = dynamic(
  () =>
    import("./ai-chef-chat-window/ai-chef-chat-window").then(
      (mod) => mod.AIChefChatWindow
    ),
  { ssr: false }
);

export function AIChefWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleAIChefClick = useCallback(() => {
    setIsChatOpen((open) => !open);
  }, []);

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
