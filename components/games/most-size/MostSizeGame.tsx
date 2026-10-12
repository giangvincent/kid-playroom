"use client";

import { SizeBoard } from "@/components/games/size/SizeBoard";
import type { GameProps } from "@/lib/games/types";

/** "Tap the biggest / smallest" — four shapes per round. */
export function MostSizeGame(props: GameProps) {
  return <SizeBoard {...props} kind="superlative" />;
}
