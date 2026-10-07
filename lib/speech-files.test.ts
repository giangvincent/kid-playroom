import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ANIMAL_LABELS, COLOR_LABELS, SHAPE_LABELS } from "@/lib/labels";
import { speechFile, speechSlug } from "@/lib/speech-files";

const GOALS = [
  "Ghép các hình giống nhau",
  "Tìm hai thẻ giống nhau",
  ...Object.values(COLOR_LABELS).map((color) => `Tìm ${color}`),
  ...Object.values(ANIMAL_LABELS).map((animal) => `Tìm tất cả ${animal}`),
  "Chạm vào hình lớn nhất",
  "Chạm vào hình nhỏ nhất",
];

const PHRASES = [
  ...Object.values(SHAPE_LABELS),
  ...Object.values(ANIMAL_LABELS),
  ...Object.values(COLOR_LABELS),
  ...GOALS,
];

describe("speechSlug", () => {
  it("strips diacritics and maps đ to d", () => {
    expect(speechSlug("Tìm màu xanh lá")).toBe("tim-mau-xanh-la");
    expect(speechSlug("con ếch")).toBe("con-ech");
    expect(speechSlug("Ghép các hình giống nhau")).toBe(
      "ghep-cac-hinh-giong-nhau",
    );
  });
});

describe("speechFile", () => {
  it("maps every spoken phrase to a committed clip", () => {
    expect(PHRASES).toHaveLength(40);
    for (const phrase of PHRASES) {
      const path = speechFile(phrase);
      const file = join(import.meta.dirname, "..", "public", path);
      expect(existsSync(file), path).toBe(true);
    }
  });
});
