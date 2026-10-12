"use client";

import { SizeBoard } from "./SizeBoard";
import type { GameProps } from "@/lib/games/types";

/** "Which one is bigger / smaller?" — two shapes per round. */
export function SizeGame(props: GameProps) {
  return <SizeBoard {...props} kind="compare" />;
}
