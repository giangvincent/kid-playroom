import type { AssetName } from "@/lib/assets";
import { shuffle } from "./shuffle";

export type SizeMode = "biggest" | "smallest";

export type SizeItem = {
  id: string;
  size: number;
};

export type SizeRound = {
  sprite: AssetName;
  mode: SizeMode;
  items: SizeItem[];
  correctId: string;
};

export const SIZE_STEPS = [56, 88, 120, 152] as const;

export function buildSizeRound(
  pool: readonly AssetName[],
  mode: SizeMode,
  rng: () => number = Math.random,
): SizeRound {
  const sprite = pool[Math.floor(rng() * pool.length)] ?? pool[0];
  const items = SIZE_STEPS.map((size, index) => ({ id: `s${index}`, size }));
  const shuffled = shuffle(items, rng);

  const correct = shuffled.reduce((best, item) => {
    if (mode === "biggest") {
      return item.size > best.size ? item : best;
    }
    return item.size < best.size ? item : best;
  });

  return { sprite, mode, items: shuffled, correctId: correct.id };
}

export function isCorrectChoice(round: SizeRound, id: string): boolean {
  return round.correctId === id;
}
