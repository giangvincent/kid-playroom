import type { AssetName } from "@/lib/assets";
import { targetCountFor } from "./boardSize";
import { shuffle } from "./shuffle";

export type SceneTile = {
  id: string;
  sprite: AssetName;
};

export type AnimalScene = {
  target: AssetName;
  tiles: SceneTile[];
  targetCount: number;
};

const KINDS = 3;

export function buildAnimalScene(
  pool: readonly AssetName[],
  tileCount: number,
  rng: () => number = Math.random,
): AnimalScene {
  const targetCount = targetCountFor(tileCount);
  const kinds = shuffle(pool, rng).slice(0, KINDS);
  const target = kinds[0];
  const distractors = kinds.slice(1);

  const sprites: AssetName[] = Array.from(
    { length: targetCount },
    () => target,
  );
  while (sprites.length < tileCount) {
    const pick = distractors[Math.floor(rng() * distractors.length)];
    sprites.push(pick ?? target);
  }

  const tiles = shuffle(sprites, rng).map((sprite, index) => ({
    id: `${sprite}-${index}`,
    sprite,
  }));

  return { target, tiles, targetCount };
}

export function countTargets(
  tiles: readonly SceneTile[],
  target: AssetName,
): number {
  return tiles.filter((tile) => tile.sprite === target).length;
}
