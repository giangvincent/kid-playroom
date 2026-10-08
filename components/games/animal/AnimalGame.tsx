"use client";

import { FindGame } from "@/components/games/find/FindGame";
import { ANIMAL_NAMES } from "@/lib/assets";
import type { GameProps } from "@/lib/games/types";
import { animalLabel } from "@/lib/labels";

export function AnimalGame(props: GameProps) {
  return <FindGame {...props} pool={ANIMAL_NAMES} label={animalLabel} />;
}
