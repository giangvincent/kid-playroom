/**
 * Name -> real asset under public/assets. Sources and licences:
 * docs/ASSETS.md (photos: Wikimedia Commons; shapes/icons: Twemoji).
 */
export const ASSETS = {
  "icon-matching": "/assets/icon-matching.svg",
  "icon-color": "/assets/icon-color.svg",
  "icon-size": "/assets/icon-size.svg",
  "icon-drawing": "/assets/icon-drawing.svg",
  "icon-memory": "/assets/icon-memory.svg",
  circle: "/assets/circle.svg",
  square: "/assets/square.svg",
  triangle: "/assets/triangle.svg",
  diamond: "/assets/diamond.svg",
  star: "/assets/star.svg",
  heart: "/assets/heart.svg",
  ring: "/assets/ring.svg",
  plus: "/assets/plus.svg",
  cat: "/assets/cat.jpg",
  dog: "/assets/dog.jpg",
  fish: "/assets/fish.jpg",
  bird: "/assets/bird.jpg",
  frog: "/assets/frog.jpg",
  rabbit: "/assets/rabbit.jpg",
} as const;

export type AssetName = keyof typeof ASSETS;

export const SHAPE_NAMES = [
  "circle",
  "square",
  "triangle",
  "diamond",
  "star",
  "heart",
  "ring",
  "plus",
] as const satisfies readonly AssetName[];

export const ANIMAL_NAMES = [
  "cat",
  "dog",
  "fish",
  "bird",
  "frog",
  "rabbit",
] as const satisfies readonly AssetName[];
