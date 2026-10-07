"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useParentGate } from "./ParentGateProvider";
import { PixelButton } from "@/components/ui/PixelButton";
import { useFullscreen } from "@/lib/hooks/useFullscreen";

function subscribeFullscreen(onChange: () => void): () => void {
  document.addEventListener("fullscreenchange", onChange);
  document.addEventListener("webkitfullscreenchange", onChange);
  return () => {
    document.removeEventListener("fullscreenchange", onChange);
    document.removeEventListener("webkitfullscreenchange", onChange);
  };
}

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
};

function fullscreenSnapshot(): boolean {
  const doc = document as FullscreenDocument;
  return doc.fullscreenElement != null || doc.webkitFullscreenElement != null;
}

export function FullscreenButton() {
  const { request, exit } = useFullscreen();
  const { requestUnlock } = useParentGate();
  // Snapshot-derived, so a fullscreenchange missed around a route mount
  // can not leave the label stuck. ponytail: engines that fire neither
  // fullscreenchange variant mid-session stay stale until the next mount.
  const isFullscreen = useSyncExternalStore(
    subscribeFullscreen,
    fullscreenSnapshot,
    () => false,
  );
  const [supported, setSupported] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setSupported(
      typeof document.documentElement.requestFullscreen === "function",
    );
    setInstalled(
      window.matchMedia(
        "(display-mode: standalone), (display-mode: fullscreen)",
      ).matches,
    );
  }, []);

  if (!supported || installed) {
    return null;
  }

  function handlePress() {
    if (isFullscreen) {
      requestUnlock(() => {
        void exit();
      });
      return;
    }
    void request();
  }

  return (
    <PixelButton
      tone="accent"
      className="px-4 text-base"
      label={
        isFullscreen ? "Thoát toàn màn hình (cần mã PIN)" : "Toàn màn hình"
      }
      onPress={handlePress}
    >
      {isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
    </PixelButton>
  );
}
