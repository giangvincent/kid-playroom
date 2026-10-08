import type { ColorName } from "@/lib/logic/color";
import {
  ANIMAL_NAMES,
  FRUIT_VEG_NAMES,
  SHAPE_NAMES,
  VEHICLE_NAMES,
} from "@/lib/assets";

type ShapeName = (typeof SHAPE_NAMES)[number];
type AnimalName = (typeof ANIMAL_NAMES)[number];
type FruitVegName = (typeof FRUIT_VEG_NAMES)[number];
type VehicleName = (typeof VEHICLE_NAMES)[number];

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
  cow: "con bò",
  chicken: "con gà",
  duck: "con vịt",
  pig: "con heo",
  dolphin: "con cá heo",
  shark: "con cá mập",
} satisfies Record<AnimalName, string>;

/** Spoken Vietnamese name for each rau quả item. */
export const FRUIT_VEG_LABELS = {
  mango: "quả xoài",
  banana: "quả chuối",
  orange: "quả cam",
  guava: "quả ổi",
  watermelon: "quả dưa hấu",
  papaya: "quả đu đủ",
  longan: "quả nhãn",
  mangosteen: "quả măng cầu",
  durian: "quả sầu riêng",
  lychee: "quả vải",
  dragonfruit: "quả thanh long",
  avocado: "quả bơ",
  tomato: "quả cà chua",
  carrot: "củ cà rốt",
  potato: "củ khoai tây",
  corn: "bắp ngô",
  pumpkin: "quả bí ngô",
  pineapple: "quả dứa",
} satisfies Record<FruitVegName, string>;

/** Spoken Vietnamese name for each xe cộ item. */
export const VEHICLE_LABELS = {
  motorbike: "xe máy",
  bicycle: "xe đạp",
  car: "xe ô tô",
  bus: "xe buýt",
  truck: "xe tải",
  firetruck: "xe cứu hỏa",
  ambulance: "xe cứu thương",
  train: "tàu hỏa",
  airplane: "máy bay",
  helicopter: "trực thăng",
  ship: "tàu thủy",
  boat: "thuyền máy",
  canoe: "xuồng",
  sampan: "thuyền",
  ferry: "phà",
  cyclo: "xích lô",
  cablecar: "cáp treo",
  coach: "xe khách",
} satisfies Record<VehicleName, string>;

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

/** Praise spoken when the child picks correctly — random pick each time. */
export const PRAISE_PHRASES = ["Đúng rồi!", "Con giỏi quá!", "Tuyệt vời!"];

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

export function fruitVegLabel(name: string): string {
  return lookup(FRUIT_VEG_LABELS, name);
}

export function vehicleLabel(name: string): string {
  return lookup(VEHICLE_LABELS, name);
}

export function colorLabel(name: string): string {
  return lookup(COLOR_LABELS, name);
}

/** Playful goal phrasing: "màu vàng" -> "Màu vàng ở đâu?" */
export function goalPhrase(label: string): string {
  const capped = label.charAt(0).toUpperCase() + label.slice(1);
  return `${capped} ở đâu?`;
}
