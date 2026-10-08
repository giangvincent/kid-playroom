import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ANIMAL_LABELS,
  COLOR_LABELS,
  FRUIT_VEG_LABELS,
  PRAISE_PHRASES,
  SHAPE_LABELS,
  VEHICLE_LABELS,
  goalPhrase,
} from "@/lib/labels";
import { speechFile, speechSlug } from "@/lib/speech-files";

const GOALS = [
  "Những hình giống nhau ở đâu?",
  "Hai thẻ giống nhau ở đâu?",
  ...Object.values(COLOR_LABELS).map(goalPhrase),
  ...Object.values(ANIMAL_LABELS).map(goalPhrase),
  ...Object.values(FRUIT_VEG_LABELS).map(goalPhrase),
  ...Object.values(VEHICLE_LABELS).map(goalPhrase),
  goalPhrase("hình lớn nhất"),
  goalPhrase("hình nhỏ nhất"),
];

const PHRASES = [
  ...Object.values(SHAPE_LABELS),
  ...Object.values(ANIMAL_LABELS),
  ...Object.values(FRUIT_VEG_LABELS),
  ...Object.values(VEHICLE_LABELS),
  ...Object.values(COLOR_LABELS),
  ...PRAISE_PHRASES,
  ...GOALS,
];

describe("speechSlug", () => {
  it("strips diacritics and maps đ to d", () => {
    expect(speechSlug("Màu xanh lá ở đâu?")).toBe("mau-xanh-la-o-dau");
    expect(speechSlug("con ếch")).toBe("con-ech");
    expect(speechSlug("Những hình giống nhau ở đâu?")).toBe(
      "nhung-hinh-giong-nhau-o-dau",
    );
  });
});

describe("speechFile", () => {
  it("maps every spoken phrase to a committed clip", () => {
    expect(PHRASES).toHaveLength(127);
    for (const phrase of PHRASES) {
      const path = speechFile(phrase);
      const file = join(import.meta.dirname, "..", "public", path);
      expect(existsSync(file), path).toBe(true);
    }
  });
});
