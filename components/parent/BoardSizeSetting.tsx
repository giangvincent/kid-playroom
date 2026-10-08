"use client";

import { cx } from "@/lib/cx";
import { BOARD_SIZES } from "@/lib/logic/boardSize";
import { useConfig } from "@/lib/store";

export function BoardSizeSetting() {
  const { config, update } = useConfig();

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-bold">Số ô</h3>
      <div className="grid grid-cols-5 gap-3">
        {BOARD_SIZES.map((size) => {
          const active = config.findBoardSize === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => update({ findBoardSize: size })}
              aria-pressed={active}
              className={cx(
                "flex min-h-16 items-center justify-center border-4 border-ink text-xl font-bold",
                "shadow-[4px_4px_0_0_var(--color-ink)]",
                active ? "bg-success" : "bg-paper",
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
