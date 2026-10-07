"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ParentGateProvider } from "@/components/child/ParentGateProvider";
import { useWakeLock } from "@/lib/hooks/useFullscreen";
import { primeSpeech } from "@/lib/speech";
import { useConfig } from "@/lib/store";

export default function PlayLayout({ children }: { children: ReactNode }) {
  const { config, ready } = useConfig();
  const router = useRouter();
  useWakeLock(true);

  useEffect(() => {
    primeSpeech();
  }, []);

  useEffect(() => {
    if (ready && !config.pin) {
      router.replace("/");
    }
  }, [ready, config.pin, router]);

  useEffect(() => {
    const blockContextMenu = (event: Event) => event.preventDefault();
    document.addEventListener("contextmenu", blockContextMenu);

    // Keep the back button/gesture inside Child Mode; the only way out is the
    // parent gate.
    window.history.pushState(null, "", window.location.href);
    const holdHistory = () =>
      window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", holdHistory);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      window.removeEventListener("popstate", holdHistory);
    };
  }, []);

  if (!ready || !config.pin) {
    return null;
  }

  return (
    <ParentGateProvider>
      {children}
    </ParentGateProvider>
  );
}
