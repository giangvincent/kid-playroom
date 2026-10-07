"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";
import { GameImage } from "@/components/ui/GameImage";
import {
  buildMatchingBoard,
  isBoardCleared,
  isMatch,
  type MatchTile,
} from "@/lib/logic/matching";
import type { GameProps } from "@/lib/games/types";
import { useTap } from "@/lib/hooks/useTap";
import { useSpeakGoal } from "@/lib/hooks/useSpeakGoal";
import { shapeLabel } from "@/lib/labels";
import { SHAPE_NAMES } from "@/lib/assets";
import { speak, playPraise } from "@/lib/speech";
import { useConfig } from "@/lib/store";

const PAIR_COUNT = 4;
const WRONG_FEEDBACK_MS = 600;
const GOAL = "Những hình giống nhau ở đâu?";

export function MatchingGame({ onWin }: GameProps) {
  const { config } = useConfig();
  const [board] = useState<MatchTile[]>(() =>
    buildMatchingBoard(SHAPE_NAMES, PAIR_COUNT),
  );
  const [firstId, setFirstId] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const press = useTap(handleTap);

  useSpeakGoal(GOAL, config.soundEnabled);

  function handleTap(tile: MatchTile) {
    if (matched.has(tile.id) || wrongIds.length > 0) {
      return;
    }

    speak(shapeLabel(tile.sprite), config.soundEnabled);

    if (firstId === null) {
      setFirstId(tile.id);
      return;
    }

    if (firstId === tile.id) {
      return;
    }

    const first = board.find((candidate) => candidate.id === firstId);
    if (!first) {
      return;
    }

    if (isMatch(first, tile)) {
      const next = new Set(matched);
      next.add(first.id);
      next.add(tile.id);
      setMatched(next);
      setFirstId(null);
      playPraise(config.soundEnabled, () => {
        if (isBoardCleared(board, next)) {
          onWin?.();
        }
      });
      return;
    }

    setWrongIds([first.id, tile.id]);
    window.setTimeout(() => {
      setWrongIds([]);
      setFirstId(null);
    }, WRONG_FEEDBACK_MS);
  }

  return (
    <div className="grid touch-none grid-cols-4 gap-3">
      {board.map((tile) => {
        const isMatched = matched.has(tile.id);
        const isWrong = wrongIds.includes(tile.id);
        const isSelected = firstId === tile.id;
        return (
          <button
            key={tile.id}
            type="button"
            disabled={isMatched}
            aria-label={shapeLabel(tile.sprite)}
              {...press(tile)}
              className={cx(
                "board-tile flex items-center justify-center border-4 border-ink",
              "shadow-[4px_4px_0_0_var(--color-ink)] transition-transform active:translate-y-[2px]",
              isWrong ? "bg-danger" : isSelected ? "bg-accent" : "bg-paper",
              isMatched && "tile-won opacity-25",
            )}
          >
              <GameImage name={tile.sprite} className="h-[72%] w-[72%]" />
          </button>
        );
      })}
    </div>
  );
}
