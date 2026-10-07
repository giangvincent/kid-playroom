import type { ColorName } from "@/lib/logic/color";
import { ANIMAL_NAMES, SHAPE_NAMES } from "@/lib/pixel/sprites";

type ShapeName = (typeof SHAPE_NAMES)[number];
type AnimalName = (typeof ANIMAL_NAMES)[number];

/** Spoken Vietnamese name for each shape sprite. */
export const SHAPE_LABELS = {
  circle: "hình tròn",
  square: "hình vuông",
  triangle: "hình tam giác",
  diamond: "hình thoi",
  star: "hình ngôi sao",
  heart: "hình trái tim",
  ring: "hình tròn rỗng",
  plus: "hình chữ thập",
} satisfies Record<ShapeName, string>;

/** Spoken Vietnamese name for each animal sprite. */
export const ANIMAL_LABELS = {
  cat: "con mèo",
  dog: "con chó",
  fish: "con cá",
  bird: "con chim",
  frog: "con ếch",
  rabbit: "con thỏ",
} satisfies Record<AnimalName, string>;

/** Spoken Vietnamese name for each colour in the colour game. */
export const COLOR_LABELS = {
  red: "màu đỏ",
  orange: "màu cam",
  yellow: "màu vàng",
  green: "màu xanh lá",
  blue: "màu xanh dương",
  purple: "màu tím",
  pink: "màu hồng",
  brown: "màu nâu",
} satisfies Record<ColorName, string>;

function lookup(map: object, key: string): string {
  const value = (map as Record<string, string>)[key];
  return value ?? key;
}

export function shapeLabel(name: string): string {
  return lookup(SHAPE_LABELS, name);
}

export function animalLabel(name: string): string {
  return lookup(ANIMAL_LABELS, name);
}

export function colorLabel(name: string): string {
  return lookup(COLOR_LABELS, name);
}
