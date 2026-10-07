"use client";

import { useEffect, useState } from "react";
import { useParentGate } from "./ParentGateProvider";
import { PixelButton } from "@/components/ui/PixelButton";
import { useFullscreen } from "@/lib/hooks/useFullscreen";

export function FullscreenButton() {
  const { request, exit } = useFullscreen();
  const { requestUnlock } = useParentGate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(
      typeof document.documentElement.requestFullscreen === "function",
    );
    const update = () => setIsFullscreen(document.fullscreenElement !== null);
    update();
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  if (!supported) {
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
