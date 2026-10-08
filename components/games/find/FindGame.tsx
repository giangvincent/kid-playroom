"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { cx } from "@/lib/cx";
import { GameImage } from "@/components/ui/GameImage";
import type { AssetName } from "@/lib/assets";
import type { GameProps } from "@/lib/games/types";
import { useTap } from "@/lib/hooks/useTap";
import { useSpeakGoal } from "@/lib/hooks/useSpeakGoal";
import { goalPhrase } from "@/lib/labels";
import { buildAnimalScene, type SceneTile } from "@/lib/logic/animalScene";
import { boardLayout } from "@/lib/logic/boardSize";
import { speak, playPraise } from "@/lib/speech";
import { useConfig } from "@/lib/store";

const WRONG_FLASH_MS = 400;

type FindGameProps = GameProps & {
  pool: readonly AssetName[];
  label: (name: string) => string;
};

/** "Find every <target>" board, shared by the animal, rau quả and xe cộ games. */
export function FindGame({ pool, label, onWin }: FindGameProps) {
  const { config } = useConfig();
  const { findBoardSize } = config;
  const layout = boardLayout(findBoardSize);
  const scene = useMemo(
    () => buildAnimalScene(pool, findBoardSize),
    [pool, findBoardSize],
  );
  const [found, setFound] = useState<Set<string>>(new Set());
  const [wrongId, setWrongId] = useState<string | null>(null);
  const goal = goalPhrase(label(scene.target));
  const press = useTap(tap);

  useSpeakGoal(goal, config.soundEnabled);

  function tap(tile: SceneTile) {
    if (found.has(tile.id)) {
      return;
    }

    speak(label(tile.sprite), config.soundEnabled);

    if (tile.sprite !== scene.target) {
      setWrongId(tile.id);
      window.setTimeout(() => setWrongId(null), WRONG_FLASH_MS);
      return;
    }

    const next = new Set(found);
    next.add(tile.id);
    setFound(next);
    if (next.size >= scene.targetCount) {
      playPraise(config.soundEnabled, () => onWin?.());
    } else {
      playPraise(config.soundEnabled);
    }
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
      <div
        className="find-board grid gap-4"
        style={
          {
            "--cols": layout.cols,
            "--rows": layout.rows,
            gridTemplateColumns: `repeat(${layout.cols}, auto)`,
          } as CSSProperties
        }
      >
        {scene.tiles.map((tile) => {
          const isFound = found.has(tile.id);
          const isWrong = wrongId === tile.id;
          return (
            <button
              key={tile.id}
              type="button"
              disabled={isFound}
              aria-label={label(tile.sprite)}
              {...press(tile)}
              className={cx(
                "board-tile flex items-center justify-center border-4 border-ink",
                "shadow-[4px_4px_0_0_var(--color-ink)] transition-transform active:translate-y-[2px]",
                isWrong ? "bg-danger" : "bg-paper",
                isFound && "tile-won opacity-25",
              )}
            >
              <GameImage name={tile.sprite} className="h-full w-full" />
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
