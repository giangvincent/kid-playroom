"use client";

import { useCallback, useEffect, useRef } from "react";

type LongPressOptions = {
  onLongPress: () => void;
  duration?: number;
};

export function useLongPress({
  onLongPress,
  duration = 3000,
}: LongPressOptions) {
  const timer = useRef<number | null>(null);
  const callback = useRef(onLongPress);

  useEffect(() => {
    callback.current = onLongPress;
  }, [onLongPress]);

  const clear = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    timer.current = window.setTimeout(() => {
      timer.current = null;
      callback.current();
    }, duration);
  }, [clear, duration]);

  useEffect(() => clear, [clear]);

  return {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
  };
}
