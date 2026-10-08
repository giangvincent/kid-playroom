import { describe, expect, it } from "vitest";
import { GAME_COLORS } from "@/lib/logic/color";
import {
  ANIMAL_NAMES,
  FRUIT_VEG_NAMES,
  SHAPE_NAMES,
  VEHICLE_NAMES,
} from "@/lib/assets";
import {
  ANIMAL_LABELS,
  COLOR_LABELS,
  FRUIT_VEG_LABELS,
  SHAPE_LABELS,
  VEHICLE_LABELS,
  animalLabel,
  colorLabel,
  fruitVegLabel,
  goalPhrase,
  shapeLabel,
  vehicleLabel,
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

  it("names every rau quả item", () => {
    for (const name of FRUIT_VEG_NAMES) {
      expect(FRUIT_VEG_LABELS[name], name).toBeTruthy();
    }
  });

  it("names every xe cộ item", () => {
    for (const name of VEHICLE_NAMES) {
      expect(VEHICLE_LABELS[name], name).toBeTruthy();
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
    expect(animalLabel("pig")).toBe("con heo");
    expect(fruitVegLabel("durian")).toBe("quả sầu riêng");
    expect(vehicleLabel("car")).toBe("xe ô tô");
    expect(colorLabel("yellow")).toBe("màu vàng");
  });

  it("falls back to the key for unknown names", () => {
    expect(shapeLabel("nope")).toBe("nope");
    expect(animalLabel("nope")).toBe("nope");
    expect(fruitVegLabel("nope")).toBe("nope");
    expect(vehicleLabel("nope")).toBe("nope");
    expect(colorLabel("nope")).toBe("nope");
  });
});

describe("goalPhrase", () => {
  it("builds the playful question form", () => {
    expect(goalPhrase("màu vàng")).toBe("Màu vàng ở đâu?");
    expect(goalPhrase("con mèo")).toBe("Con mèo ở đâu?");
    expect(goalPhrase("quả dứa")).toBe("Quả dứa ở đâu?");
    expect(goalPhrase("xe máy")).toBe("Xe máy ở đâu?");
    expect(goalPhrase("hình lớn nhất")).toBe("Hình lớn nhất ở đâu?");
  });
});
