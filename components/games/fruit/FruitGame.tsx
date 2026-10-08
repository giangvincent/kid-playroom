"use client";

import { FindGame } from "@/components/games/find/FindGame";
import { FRUIT_VEG_NAMES } from "@/lib/assets";
import type { GameProps } from "@/lib/games/types";
import { fruitVegLabel } from "@/lib/labels";

export function FruitGame(props: GameProps) {
  return <FindGame {...props} pool={FRUIT_VEG_NAMES} label={fruitVegLabel} />;
}
