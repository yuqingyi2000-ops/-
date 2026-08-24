"use client";

import { useEffect, useState } from "react";
import {
  Banner,
  BannerDescription,
  BannerTitle,
  Button,
} from "@khamudom/lumen-ui-react";
import styles from "./service-worker-update-handler.module.css";

export function ServiceWorkerUpdateHandler() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleUpdateFound = () => {
      setUpdateAvailable(true);
    };

    const handleControllerChange = () => {
      setUpdateAvailable(false);
      setIsUpdating(false);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "SW_UPDATED") {
        setUpdateAvailable(false);
        setIsUpdating(false);
      }
    };

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          setUpdateAvailable(true);
        }
      });
    }

    navigator.serviceWorker.addEventListener("updatefound", handleUpdateFound);
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );
    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener(
        "updatefound",
        handleUpdateFound
      );
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleUpdate = () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    setIsUpdating(true);

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    });

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className={styles.updateNotification}>
      <Banner
        variant="default"
        onDismiss={() => setUpdateAvailable(false)}
        dismissLabel="Dismiss update"
      >
        <BannerTitle>New Update Available</BannerTitle>
        <BannerDescription>
          A new version of The Recipe Room is ready to install
        </BannerDescription>
        <div className={styles.updateActions}>
          <Button onClick={handleUpdate} loading={isUpdating}>
            {isUpdating ? "Updating..." : "Update Now"}
          </Button>
        </div>
      </Banner>
    </div>
  );
}
