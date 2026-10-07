"use client";

import { useParentGate } from "./ParentGateProvider";
import { useExitToHome } from "@/lib/hooks/useExitToHome";
import { useLongPress } from "@/lib/hooks/useLongPress";

export function ExitCorner() {
  const { requestUnlock } = useParentGate();
  const exitToHome = useExitToHome();
  const handlers = useLongPress({
    onLongPress: () => requestUnlock(exitToHome),
    duration: 3000,
  });

  return (
    <button
      type="button"
      aria-label="Giữ để thoát"
      {...handlers}
      style={{
        top: "env(safe-area-inset-top)",
        left: "env(safe-area-inset-left)",
      }}
      className="fixed z-40 flex h-16 w-16 items-center justify-center"
    >
      <span className="h-2 w-2 rounded-full bg-ink/20" />
    </button>
  );
}
