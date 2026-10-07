"use client";

import { useEffect, useRef } from "react";
import { announce } from "@/lib/speech";

/**
 * Announce a round's goal. Re-announces when the wording or the round nonce
 * changes (a re-randomised board with the same wording still announces), and
 * de-duplicates React's development double-invoke.
 */
export function useSpeakGoal(
  text: string,
  enabled: boolean,
  nonce: number = 0,
): void {
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const key = `${nonce}|${enabled}|${text}`;
    if (lastKey.current === key) {
      return;
    }
    lastKey.current = key;
    announce(text, enabled);
  }, [text, enabled, nonce]);
}
