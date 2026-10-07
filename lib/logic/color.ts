import { shuffle } from "./shuffle";

export type ColorOption = {
  name: string;
  hex: string;
};

/** The colours the colour game draws from; the single source for their names. */
export const GAME_COLORS = [
  { name: "red", hex: "#ff004d" },
  { name: "orange", hex: "#ffa300" },
  { name: "yellow", hex: "#ffec27" },
  { name: "green", hex: "#00e436" },
  { name: "blue", hex: "#29adff" },
  { name: "purple", hex: "#83769c" },
  { name: "pink", hex: "#ff77a8" },
  { name: "brown", hex: "#ab5236" },
] as const satisfies readonly ColorOption[];

export type ColorName = (typeof GAME_COLORS)[number]["name"];

export type ColorRound = {
  target: ColorOption;
  options: ColorOption[];
};

export function buildColorRound(
  colors: readonly ColorOption[],
  optionCount: number,
  rng: () => number = Math.random,
): ColorRound {
  const picked = shuffle(colors, rng).slice(0, optionCount);
  const target = picked[Math.min(picked.length - 1, Math.floor(rng() * picked.length))];
  return { target, options: shuffle(picked, rng) };
}

export function isTargetColor(round: ColorRound, option: ColorOption): boolean {
  return option.name === round.target.name;
}
