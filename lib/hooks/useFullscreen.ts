"use client";

import { useCallback, useEffect } from "react";

export function useFullscreen() {
  const request = useCallback(async () => {
    const element = document.documentElement;
    if (typeof element.requestFullscreen !== "function") {
      return;
    }
    try {
      await element.requestFullscreen();
    } catch {
      // Rejected without a user gesture, or unsupported — non-fatal.
    }
  }, []);

  const exit = useCallback(async () => {
    if (!document.fullscreenElement || typeof document.exitFullscreen !== "function") {
      return;
    }
    try {
      await document.exitFullscreen();
    } catch {
      // Ignore.
    }
  }, []);

  return { request, exit };
}

export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !navigator.wakeLock) {
      return;
    }

    let sentinel: WakeLockSentinel | null = null;

    async function acquire() {
      try {
        sentinel = await navigator.wakeLock.request("screen");
      } catch {
        // Not allowed or unsupported.
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        void acquire();
      }
    }

    void acquire();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      void sentinel?.release();
    };
  }, [active]);
}
