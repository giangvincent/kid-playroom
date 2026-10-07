"use client";

import { useParentGate } from "./ParentGateProvider";
import { PixelButton } from "@/components/ui/PixelButton";
import { useExitToHome } from "@/lib/hooks/useExitToHome";

export function HomeButton() {
  const { requestUnlock } = useParentGate();
  const exitToHome = useExitToHome();

  return (
    <PixelButton
      tone="accent"
      className="px-4 text-base"
      label="Về nhà (cần mã PIN)"
      onPress={() => requestUnlock(exitToHome)}
    >
      Về nhà
    </PixelButton>
  );
}
