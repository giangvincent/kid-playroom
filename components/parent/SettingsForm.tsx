"use client";

import { useState } from "react";
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
      <button
        type="button"
        onClick={() => update({ soundEnabled: !config.soundEnabled })}
        className={cx(
          "flex min-h-16 items-center border-4 border-ink px-5 text-lg font-bold",
          "shadow-[4px_4px_0_0_var(--color-ink)]",
          config.soundEnabled ? "bg-success" : "bg-paper",
        )}
      >
        Âm thanh: {config.soundEnabled ? "Bật" : "Tắt"}
      </button>
      <PixelButton tone="accent" onPress={() => setChangingPin(true)}>
        Đổi mã PIN
      </PixelButton>
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
