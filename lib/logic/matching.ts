import type { SpriteName } from "@/lib/pixel/sprites";
import { shuffle } from "./shuffle";

export type MatchTile = {
  id: string;
  sprite: SpriteName;
};

export function buildMatchingBoard(
  pool: readonly SpriteName[],
  pairCount: number,
  rng: () => number = Math.random,
): MatchTile[] {
  const chosen = shuffle(pool, rng).slice(0, pairCount);
  const tiles: MatchTile[] = [];
  chosen.forEach((sprite, index) => {
    tiles.push({ id: `${sprite}-a-${index}`, sprite });
    tiles.push({ id: `${sprite}-b-${index}`, sprite });
  });
  return shuffle(tiles, rng);
}

export function isMatch(a: MatchTile, b: MatchTile): boolean {
  return a.id !== b.id && a.sprite === b.sprite;
}

export function isBoardCleared(tiles: MatchTile[], matched: Set<string>): boolean {
  return matched.size === tiles.length;
}
