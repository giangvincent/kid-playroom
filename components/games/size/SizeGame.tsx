"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";
import { PixelSprite } from "@/components/ui/PixelSprite";
import {
  buildSizeRound,
  isCorrectChoice,
  type SizeMode,
} from "@/lib/logic/size";
import type { GameProps } from "@/lib/games/types";
import { useSpeakGoal } from "@/lib/hooks/useSpeakGoal";
import { SHAPE_NAMES } from "@/lib/pixel/sprites";
import { useConfig } from "@/lib/store";

const ROUND_MODES = ["biggest", "smallest", "biggest"] as const satisfies
  readonly SizeMode[];
const ROUNDS = ROUND_MODES.length;
const WRONG_FLASH_MS = 400;

function goalFor(mode: SizeMode): string {
  return `Chạm vào hình ${mode === "biggest" ? "lớn nhất" : "nhỏ nhất"}`;
}

export function SizeGame({ onWin }: GameProps) {
  const { config } = useConfig();
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState(() =>
    buildSizeRound(SHAPE_NAMES, ROUND_MODES[0]),
  );
  const [wrongId, setWrongId] = useState<string | null>(null);

  useSpeakGoal(goalFor(round.mode), config.soundEnabled, roundIndex);

  function choose(id: string) {
    if (isCorrectChoice(round, id)) {
      const next = roundIndex + 1;
      if (next >= ROUNDS) {
        onWin?.();
        return;
      }
      setRoundIndex(next);
      setRound(buildSizeRound(SHAPE_NAMES, ROUND_MODES[next]));
      return;
    }

    setWrongId(id);
    window.setTimeout(() => setWrongId(null), WRONG_FLASH_MS);
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-2xl font-bold">{goalFor(round.mode)}</p>
      <div className="flex items-end justify-center gap-6">
        {round.items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => choose(item.id)}
            className={cx(
              "flex items-end justify-center border-4 border-ink p-2",
              "shadow-[4px_4px_0_0_var(--color-ink)] transition-transform active:translate-y-[2px]",
              wrongId === item.id ? "bg-danger" : "bg-paper",
            )}
          >
            <PixelSprite name={round.sprite} size={item.size} />
          </button>
        ))}
      </div>
      <p className="text-lg font-bold">
        {roundIndex + 1} / {ROUNDS}
      </p>
    </div>
  );
}
