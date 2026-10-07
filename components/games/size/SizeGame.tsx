"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";
import { GameImage } from "@/components/ui/GameImage";
import {
  buildSizeRound,
  isCorrectChoice,
  type SizeMode,
} from "@/lib/logic/size";
import type { GameProps } from "@/lib/games/types";
import { useTap } from "@/lib/hooks/useTap";
import { useSpeakGoal } from "@/lib/hooks/useSpeakGoal";
import { SHAPE_NAMES } from "@/lib/assets";
import { goalPhrase } from "@/lib/labels";
import { useConfig } from "@/lib/store";

const ROUND_MODES = ["biggest", "smallest", "biggest"] as const satisfies
  readonly SizeMode[];
const ROUNDS = ROUND_MODES.length;
const WRONG_FLASH_MS = 400;

function goalFor(mode: SizeMode): string {
  return goalPhrase(mode === "biggest" ? "hình lớn nhất" : "hình nhỏ nhất");
}

const STEP_CLASSES = [
  "h-[clamp(4rem,9vmin,8rem)] w-[clamp(4rem,9vmin,8rem)]",
  "h-[clamp(5.5rem,13vmin,11rem)] w-[clamp(5.5rem,13vmin,11rem)]",
  "h-[clamp(7rem,17vmin,14rem)] w-[clamp(7rem,17vmin,14rem)]",
  "h-[clamp(8.5rem,21vmin,17.5rem)] w-[clamp(8.5rem,21vmin,17.5rem)]",
];

export function SizeGame({ onWin }: GameProps) {
  const { config } = useConfig();
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState(() =>
    buildSizeRound(SHAPE_NAMES, ROUND_MODES[0]),
  );
  const [wrongId, setWrongId] = useState<string | null>(null);
  const press = useTap(choose);

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
    <div className="flex touch-none flex-col items-center gap-8">
      <p className="text-2xl font-bold">{goalFor(round.mode)}</p>
      <div className="flex items-end justify-center gap-6">
        {round.items.map((item) => (
          <button
            key={item.id}
            type="button"
            {...press(item.id)}
            className={cx(
              "flex items-end justify-center border-4 border-ink p-2",
              STEP_CLASSES[item.size - 1],
              "shadow-[4px_4px_0_0_var(--color-ink)] transition-transform active:translate-y-[2px]",
              wrongId === item.id ? "bg-danger" : "bg-paper",
            )}
          >
            <GameImage name={round.sprite} className="h-full w-full" />
          </button>
        ))}
      </div>
      <p className="text-lg font-bold">
        {roundIndex + 1} / {ROUNDS}
      </p>
    </div>
  );
}
