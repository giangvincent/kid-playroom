"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";
import { PixelSprite } from "@/components/ui/PixelSprite";
import {
  buildMatchingBoard,
  isMatch,
  type MatchTile,
} from "@/lib/logic/matching";
import type { GameProps } from "@/lib/games/types";
import { useSpeakGoal } from "@/lib/hooks/useSpeakGoal";
import { animalLabel } from "@/lib/labels";
import { ANIMAL_NAMES } from "@/lib/pixel/sprites";
import { speak } from "@/lib/speech";
import { useConfig } from "@/lib/store";

const PAIR_COUNT = 6;
const FLIP_BACK_MS = 800;
const GOAL = "Tìm hai thẻ giống nhau";

export function MemoryGame({ onWin }: GameProps) {
  const { config } = useConfig();
  const [deck] = useState<MatchTile[]>(() =>
    buildMatchingBoard(ANIMAL_NAMES, PAIR_COUNT),
  );
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  useSpeakGoal(GOAL, config.soundEnabled);

  function flip(tile: MatchTile) {
    if (busy || matched.has(tile.id) || flipped.includes(tile.id)) {
      return;
    }

    const nextFlipped = [...flipped, tile.id];
    setFlipped(nextFlipped);
    speak(animalLabel(tile.sprite), config.soundEnabled);

    if (nextFlipped.length < 2) {
      return;
    }

    const first = deck.find((candidate) => candidate.id === nextFlipped[0]);
    const second = deck.find((candidate) => candidate.id === nextFlipped[1]);
    if (!first || !second) {
      return;
    }

    if (isMatch(first, second)) {
      const nextMatched = new Set(matched);
      nextMatched.add(first.id);
      nextMatched.add(second.id);
      setMatched(nextMatched);
      setFlipped([]);
      if (nextMatched.size === deck.length) {
        onWin?.();
      }
      return;
    }

    setBusy(true);
    window.setTimeout(() => {
      setFlipped([]);
      setBusy(false);
    }, FLIP_BACK_MS);
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {deck.map((tile) => {
        const isMatched = matched.has(tile.id);
        const faceUp = isMatched || flipped.includes(tile.id);
        return (
          <button
            key={tile.id}
            type="button"
            onClick={() => flip(tile)}
            aria-label={faceUp ? animalLabel(tile.sprite) : "Thẻ"}
            className={cx(
              "flex h-24 w-24 items-center justify-center border-4 border-ink",
              "shadow-[4px_4px_0_0_var(--color-ink)] transition-transform active:translate-y-[2px]",
              faceUp ? "bg-paper" : "bg-purple",
              isMatched && "opacity-40",
            )}
          >
            {faceUp ? (
              <PixelSprite name={tile.sprite} size={72} />
            ) : (
              <span className="text-3xl font-bold text-paper">?</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
