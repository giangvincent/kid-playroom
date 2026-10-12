import type { AssetName } from "@/lib/assets";
import { shuffle } from "./shuffle";

export type SizeMode = "biggest" | "smallest";
export type CompareMode = "bigger" | "smaller";

export type SizeItem = {
  id: string;
  size: number;
};

export type SizeRound<M extends string = SizeMode> = {
  sprite: AssetName;
  mode: M;
  items: SizeItem[];
  correctId: string;
};

/** Relative size weights; the game maps each to a viewport-based pixel size. */
export const SIZE_STEPS = [1, 2, 3, 4] as const;

/** Sizes at least two steps apart, so a comparison is never a near-tie. */
const PAIRS: ReadonlyArray<readonly [number, number]> = SIZE_STEPS.flatMap((a) =>
  SIZE_STEPS.filter((b) => b - a >= 2).map((b) => [a, b] as const),
);

function spriteFrom(
  pool: readonly AssetName[],
  rng: () => number,
): AssetName {
  return pool[Math.floor(rng() * pool.length)] ?? pool[0];
}

function extreme(items: SizeItem[], mode: SizeMode): SizeItem {
  return items.reduce((best, item) => {
    if (mode === "biggest") {
      return item.size > best.size ? item : best;
    }
    return item.size < best.size ? item : best;
  });
}

/** "Tap the biggest / smallest" board: four sizes, one extreme (most-size). */
export function buildSizeRound(
  pool: readonly AssetName[],
  mode: SizeMode,
  rng: () => number = Math.random,
): SizeRound<SizeMode> {
  const items = shuffle(
    SIZE_STEPS.map((size, index) => ({ id: `s${index}`, size })),
    rng,
  );
  return { sprite: spriteFrom(pool, rng), mode, items, correctId: extreme(items, mode).id };
}

/** "Which one is bigger / smaller?" board: two clearly different sizes (size). */
export function buildCompareRound(
  pool: readonly AssetName[],
  mode: CompareMode,
  rng: () => number = Math.random,
): SizeRound<CompareMode> {
  const pair = PAIRS[Math.floor(rng() * PAIRS.length)] ?? ([1, 4] as const);
  const items = shuffle(
    pair.map((size, index) => ({ id: `s${index}`, size })),
    rng,
  );
  const want: SizeMode = mode === "bigger" ? "biggest" : "smallest";
  return { sprite: spriteFrom(pool, rng), mode, items, correctId: extreme(items, want).id };
}

export function isCorrectChoice(round: { correctId: string }, id: string): boolean {
  return round.correctId === id;
}
