import { describe, expect, it } from "vitest";
import { GAME_COLORS } from "@/lib/logic/color";
import { ANIMAL_NAMES, SHAPE_NAMES } from "@/lib/assets";
import {
  ANIMAL_LABELS,
  COLOR_LABELS,
  SHAPE_LABELS,
  animalLabel,
  colorLabel,
  shapeLabel,
} from "./labels";

describe("label coverage", () => {
  it("names every shape", () => {
    for (const name of SHAPE_NAMES) {
      expect(SHAPE_LABELS[name], name).toBeTruthy();
      expect(SHAPE_LABELS[name].startsWith("hình "), name).toBe(true);
    }
  });

  it("names every animal", () => {
    for (const name of ANIMAL_NAMES) {
      expect(ANIMAL_LABELS[name], name).toBeTruthy();
      expect(ANIMAL_LABELS[name].startsWith("con "), name).toBe(true);
    }
  });

  it("names every colour the colour game can show", () => {
    for (const option of GAME_COLORS) {
      expect(COLOR_LABELS[option.name], option.name).toBeTruthy();
      expect(COLOR_LABELS[option.name].startsWith("màu "), option.name).toBe(true);
    }
  });
});

describe("label lookups", () => {
  it("returns the Vietnamese phrase for known keys", () => {
    expect(shapeLabel("circle")).toBe("hình tròn");
    expect(animalLabel("cat")).toBe("con mèo");
    expect(colorLabel("yellow")).toBe("màu vàng");
  });

  it("falls back to the key for unknown names", () => {
    expect(shapeLabel("nope")).toBe("nope");
    expect(animalLabel("nope")).toBe("nope");
    expect(colorLabel("nope")).toBe("nope");
  });
});
