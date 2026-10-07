import { AnimalGame } from "@/components/games/animal/AnimalGame";
import { ColorGame } from "@/components/games/color/ColorGame";
import { DrawingGame } from "@/components/games/drawing/DrawingGame";
import { MatchingGame } from "@/components/games/matching/MatchingGame";
import { MemoryGame } from "@/components/games/memory/MemoryGame";
import { SizeGame } from "@/components/games/size/SizeGame";
import type { GameDefinition } from "./types";

/** Single source of truth for the games in the playroom, in display order. */
export const GAMES: readonly GameDefinition[] = [
  {
    id: "matching",
    title: "Ghép đôi",
    icon: "icon-matching",
    Component: MatchingGame,
  },
  {
    id: "color",
    title: "Màu sắc",
    icon: "icon-color",
    Component: ColorGame,
  },
  {
    id: "animal",
    title: "Con vật",
    icon: "cat",
    Component: AnimalGame,
  },
  {
    id: "size",
    title: "Kích thước",
    icon: "icon-size",
    Component: SizeGame,
  },
  {
    id: "drawing",
    title: "Vẽ",
    icon: "icon-drawing",
    Component: DrawingGame,
  },
  {
    id: "memory",
    title: "Trí nhớ",
    icon: "icon-memory",
    Component: MemoryGame,
  },
];

export function getGame(id: string): GameDefinition | undefined {
  return GAMES.find((game) => game.id === id);
}
