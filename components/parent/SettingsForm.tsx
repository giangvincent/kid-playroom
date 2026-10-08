"use client";

import { useState } from "react";
import { BoardSizeSetting } from "./BoardSizeSetting";
import { PinSetup } from "./PinSetup";
import { PixelButton } from "@/components/ui/PixelButton";
import { Modal } from "@/components/ui/Modal";
import { cx } from "@/lib/cx";
import { useConfig } from "@/lib/store";

export function SettingsForm() {
  const { config, update } = useConfig();
  const [changingPin, setChangingPin] = useState(false);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Cài đặt</h2>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => update({ soundEnabled: !config.soundEnabled })}
          aria-pressed={config.soundEnabled}
          className={cx(
            "flex min-h-24 flex-col items-center justify-center gap-1 border-4 border-ink p-4 text-lg font-bold",
            "shadow-[4px_4px_0_0_var(--color-ink)]",
            config.soundEnabled ? "bg-success" : "bg-paper",
          )}
        >
          <span>Âm thanh</span>
          <span>{config.soundEnabled ? "Bật" : "Tắt"}</span>
        </button>
        <PixelButton
          tone="accent"
          className="min-h-24"
          onPress={() => setChangingPin(true)}
        >
          Đổi mã PIN
        </PixelButton>
      </div>
      <BoardSizeSetting />
      <Modal open={changingPin}>
        <div className="flex flex-col items-center gap-5">
          <h2 className="text-xl font-bold">Mã PIN mới</h2>
          <PinSetup
            onSet={(pin) => {
              update({ pin });
              setChangingPin(false);
            }}
          />
          <PixelButton tone="accent" onPress={() => setChangingPin(false)}>
            Huỷ
          </PixelButton>
        </div>
      </Modal>
    </section>
  );
}
