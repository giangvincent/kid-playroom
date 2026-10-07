import type { SpriteName } from "@/lib/pixel/sprites";
import { shuffle } from "./shuffle";

export type SceneTile = {
  id: string;
  sprite: SpriteName;
};

export type AnimalScene = {
  target: SpriteName;
  tiles: SceneTile[];
  targetCount: number;
};

const KINDS = 3;
const TARGET_COUNT = 3;
const TILE_COUNT = 12;

export function buildAnimalScene(
  pool: readonly SpriteName[],
  rng: () => number = Math.random,
): AnimalScene {
  const kinds = shuffle(pool, rng).slice(0, KINDS);
  const target = kinds[0];
  const distractors = kinds.slice(1);

  const sprites: SpriteName[] = Array.from(
    { length: TARGET_COUNT },
    () => target,
  );
  while (sprites.length < TILE_COUNT) {
    const pick = distractors[Math.floor(rng() * distractors.length)];
    sprites.push(pick ?? target);
  }

  const tiles = shuffle(sprites, rng).map((sprite, index) => ({
    id: `${sprite}-${index}`,
    sprite,
  }));

  return { target, tiles, targetCount: TARGET_COUNT };
}

export function countTargets(
  tiles: readonly SceneTile[],
  target: SpriteName,
): number {
  return tiles.filter((tile) => tile.sprite === target).length;
}
