"use client";

import { useEffect } from "react";

const OVERLAY_SELECTOR = [
  ".lumen-dialog__portal",
  ".lumen-alert-dialog__portal",
  ".lumen-drawer__portal--visible",
  ".ai-chef-overlay",
].join(",");

export function useOverlayScrollLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    let scrollY = 0;
    let locked = false;

    const applyLock = (shouldLock: boolean) => {
      if (shouldLock === locked) return;

      if (shouldLock) {
        scrollY = window.scrollY;
        const scrollbarWidth = window.innerWidth - html.clientWidth;
        html.classList.add("overlay-open");
        body.style.top = `-${scrollY}px`;
        if (scrollbarWidth > 0) {
          body.style.paddingRight = `${scrollbarWidth}px`;
        }
        locked = true;
        return;
      }

      html.classList.remove("overlay-open");
      body.style.top = "";
      body.style.paddingRight = "";
      locked = false;
      window.scrollTo(0, scrollY);
    };

    const sync = () => {
      applyLock(Boolean(document.querySelector(OVERLAY_SELECTOR)));
    };

    const observer = new MutationObserver(sync);
    observer.observe(body, { childList: true, subtree: true });
    sync();

    return () => {
      observer.disconnect();
      applyLock(false);
    };
  }, []);
}
