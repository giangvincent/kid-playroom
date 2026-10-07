"use client";

import {
  useCallback,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";

const CLICK_GUARD_MS = 500;
const PALM_AREA_PX2 = 9000;

/** ponytail: contact-area heuristic for resting palms; lower the threshold
 *  if a deliberate tap is ever rejected. */
export function isPalm(width: number, height: number): boolean {
  return width * height > PALM_AREA_PX2;
}

/** True when a click is not the derived twin of a just-handled pointer. */
export function isFreshClick(now: number, lastPointerAt: number): boolean {
  return now - lastPointerAt > CLICK_GUARD_MS;
}

/**
 * Tile input for touch screens: the action runs on pointerup, which fires for
 * every finger, so a second-finger tap still registers while the first rests
 * on screen (WebKit derives click only from the primary touch). Palm-sized
 * contact areas are ignored and the browser's derived click is dropped so
 * nothing double-fires; keyboard clicks still pass.
 */
export function useTap<T>(action: (target: T) => void) {
  const actionRef = useRef(action);
  actionRef.current = action;
  const lastPointerAt = useRef(0);

  return useCallback(
    (target: T) => ({
      onPointerUp: (event: ReactPointerEvent) => {
        lastPointerAt.current = Date.now();
        if (
          event.pointerType === "touch" &&
          isPalm(event.width, event.height)
        ) {
          return;
        }
        actionRef.current(target);
      },
      onClick: () => {
        if (isFreshClick(Date.now(), lastPointerAt.current)) {
          actionRef.current(target);
        }
      },
    }),
    [],
  );
}
