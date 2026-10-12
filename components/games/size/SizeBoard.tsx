"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";
import { GameImage } from "@/components/ui/GameImage";
import {
  buildCompareRound,
  buildSizeRound,
  isCorrectChoice,
  type CompareMode,
  type SizeMode,
  type SizeRound,
} from "@/lib/logic/size";
import type { GameProps } from "@/lib/games/types";
import { useTap } from "@/lib/hooks/useTap";
import { useSpeakGoal } from "@/lib/hooks/useSpeakGoal";
import { SHAPE_NAMES } from "@/lib/assets";
import { comparePhrase, goalPhrase } from "@/lib/labels";
import { playPraise } from "@/lib/speech";
import { useConfig } from "@/lib/store";

const WRONG_FLASH_MS = 400;

const STEP_CLASSES = [
  "h-[clamp(4rem,9vmin,8rem)] w-[clamp(4rem,9vmin,8rem)]",
  "h-[clamp(5.5rem,13vmin,11rem)] w-[clamp(5.5rem,13vmin,11rem)]",
  "h-[clamp(7rem,17vmin,14rem)] w-[clamp(7rem,17vmin,14rem)]",
  "h-[clamp(8.5rem,21vmin,17.5rem)] w-[clamp(8.5rem,21vmin,17.5rem)]",
];

/** The bigger/smaller comparison (size) and the biggest/smallest board
 *  (most-size) share this component; only the rule and wording differ. */
export type SizeKind = "compare" | "superlative";

const KINDS: Record<
  SizeKind,
  {
    modes: readonly string[];
    build: (mode: string) => SizeRound<string>;
    goal: (mode: string) => string;
  }
> = {
  compare: {
    modes: ["bigger", "smaller", "bigger"],
    build: (mode) => buildCompareRound(SHAPE_NAMES, mode as CompareMode),
    goal: (mode) => comparePhrase(mode === "bigger" ? "hình lớn hơn" : "hình nhỏ hơn"),
  },
  superlative: {
    modes: ["biggest", "smallest", "biggest"],
    build: (mode) => buildSizeRound(SHAPE_NAMES, mode as SizeMode),
    goal: (mode) => goalPhrase(mode === "biggest" ? "hình lớn nhất" : "hình nhỏ nhất"),
  },
};

export function SizeBoard({ kind, onWin }: GameProps & { kind: SizeKind }) {
  const { config } = useConfig();
  const { modes, build, goal } = KINDS[kind];
  const rounds = modes.length;
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState(() => build(modes[0]));
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wonId, setWonId] = useState<string | null>(null);
  const press = useTap(choose);

  useSpeakGoal(goal(round.mode), config.soundEnabled, roundIndex);

  function choose(id: string) {
    if (busy) {
      return;
    }

    if (isCorrectChoice(round, id)) {
      const next = roundIndex + 1;
      setBusy(true);
      setWonId(id);
      playPraise(config.soundEnabled, () => {
        setBusy(false);
        setWonId(null);
        if (next >= rounds) {
          onWin?.();
          return;
        }
        setRoundIndex(next);
        setRound(build(modes[next]));
      });
      return;
    }

    setWrongId(id);
    window.setTimeout(() => setWrongId(null), WRONG_FLASH_MS);
  }

  return (
    <div className="flex touch-none flex-col items-center gap-8">
      <p className="text-2xl font-bold">{goal(round.mode)}</p>
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
              wonId === item.id && "tile-won",
            )}
          >
            <GameImage name={round.sprite} className="h-full w-full" />
          </button>
        ))}
      </div>
      <p className="text-lg font-bold">
        {roundIndex + 1} / {rounds}
      </p>
    </div>
  );
}
