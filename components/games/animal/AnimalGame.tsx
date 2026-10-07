"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";
import { GameImage } from "@/components/ui/GameImage";
import { buildAnimalScene, type SceneTile } from "@/lib/logic/animalScene";
import type { GameProps } from "@/lib/games/types";
import { useTap } from "@/lib/hooks/useTap";
import { useSpeakGoal } from "@/lib/hooks/useSpeakGoal";
import { animalLabel, goalPhrase } from "@/lib/labels";
import { ANIMAL_NAMES } from "@/lib/assets";
import { speak } from "@/lib/speech";
import { useConfig } from "@/lib/store";

const WRONG_FLASH_MS = 400;

export function AnimalGame({ onWin }: GameProps) {
  const { config } = useConfig();
  const [scene] = useState(() => buildAnimalScene(ANIMAL_NAMES));
  const [found, setFound] = useState<Set<string>>(new Set());
  const [wrongId, setWrongId] = useState<string | null>(null);
  const goal = goalPhrase(animalLabel(scene.target));
  const press = useTap(tap);

  useSpeakGoal(goal, config.soundEnabled);

  function tap(tile: SceneTile) {
    if (found.has(tile.id)) {
      return;
    }

    speak(animalLabel(tile.sprite), config.soundEnabled);

    if (tile.sprite === scene.target) {
      const next = new Set(found);
      next.add(tile.id);
      setFound(next);
      if (next.size >= scene.targetCount) {
        onWin?.();
      }
      return;
    }

    setWrongId(tile.id);
    window.setTimeout(() => setWrongId(null), WRONG_FLASH_MS);
  }

  return (
    <div className="flex touch-none flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold">{goal}</span>
        <GameImage
          name={scene.target}
          className="h-[min(14vmin,7rem)] w-[min(14vmin,7rem)]"
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {scene.tiles.map((tile) => {
          const isFound = found.has(tile.id);
          const isWrong = wrongId === tile.id;
          return (
            <button
              key={tile.id}
              type="button"
              disabled={isFound}
              aria-label={animalLabel(tile.sprite)}
              {...press(tile)}
              className={cx(
                "board-tile flex items-center justify-center border-4 border-ink",
                "shadow-[4px_4px_0_0_var(--color-ink)] transition-transform active:translate-y-[2px]",
                isWrong ? "bg-danger" : "bg-paper",
                isFound && "opacity-25",
              )}
            >
              <GameImage name={tile.sprite} className="h-[72%] w-[72%]" />
            </button>
          );
        })}
      </div>
      <p className="text-lg font-bold">
        {found.size} / {scene.targetCount}
      </p>
    </div>
  );
}
