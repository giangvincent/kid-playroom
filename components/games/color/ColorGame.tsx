"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";
import {
  GAME_COLORS,
  buildColorRound,
  isTargetColor,
  type ColorOption,
} from "@/lib/logic/color";
import type { GameProps } from "@/lib/games/types";
import { useTap } from "@/lib/hooks/useTap";
import { useSpeakGoal } from "@/lib/hooks/useSpeakGoal";
import { colorLabel, goalPhrase } from "@/lib/labels";
import { speak, playPraise } from "@/lib/speech";
import { useConfig } from "@/lib/store";

const OPTION_COUNT = 4;
const ROUNDS = 5;
const WRONG_FLASH_MS = 400;

export function ColorGame({ onWin }: GameProps) {
  const { config } = useConfig();
  const [round, setRound] = useState(() =>
    buildColorRound(GAME_COLORS, OPTION_COUNT),
  );
  const [roundIndex, setRoundIndex] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [won, setWon] = useState<string | null>(null);
  const goal = goalPhrase(colorLabel(round.target.name));
  const press = useTap(choose);

  useSpeakGoal(goal, config.soundEnabled, roundIndex);

  function choose(option: ColorOption) {
    if (busy) {
      return;
    }
    speak(colorLabel(option.name), config.soundEnabled);

    if (isTargetColor(round, option)) {
      const next = roundIndex + 1;
      setBusy(true);
      setWon(option.name);
      playPraise(config.soundEnabled, () => {
        setBusy(false);
        setWon(null);
        if (next >= ROUNDS) {
          onWin?.();
          return;
        }
        setRoundIndex(next);
        setRound(buildColorRound(GAME_COLORS, OPTION_COUNT));
      });
      return;
    }

    setWrong(option.name);
    window.setTimeout(() => setWrong(null), WRONG_FLASH_MS);
  }

  return (
    <div className="flex touch-none flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <span className="text-2xl font-bold">{goal}</span>
        <span
          className="h-[min(30vmin,18rem)] w-[min(30vmin,18rem)] border-4 border-ink shadow-[4px_4px_0_0_var(--color-ink)]"
          style={{ backgroundColor: round.target.hex }}
        />
      </div>
      <div className="flex flex-wrap justify-center gap-5">
        {round.options.map((option) => (
          <button
            key={option.name}
            type="button"
            aria-label={colorLabel(option.name)}
            {...press(option)}
            style={{ backgroundColor: option.hex }}
            className={cx(
              "h-[min(24vmin,15rem)] w-[min(24vmin,15rem)] border-4 border-ink",
              "shadow-[4px_4px_0_0_var(--color-ink)] transition-transform active:translate-y-[2px]",
              wrong === option.name && "opacity-40",
              won === option.name && "tile-won",
            )}
          />
        ))}
      </div>
      <p className="text-lg font-bold">
        {roundIndex + 1} / {ROUNDS}
      </p>
    </div>
  );
}
