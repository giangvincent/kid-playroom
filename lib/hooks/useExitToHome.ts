"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useFullscreen } from "./useFullscreen";

/** Leave fullscreen (if any) and return to Parent Mode. */
export function useExitToHome(): () => Promise<void> {
  const router = useRouter();
  const { exit } = useFullscreen();

  return useCallback(async () => {
    await exit();
    router.push("/");
  }, [exit, router]);
}
