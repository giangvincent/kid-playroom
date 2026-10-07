import { describe, expect, it } from "vitest";
import { PALETTE, TRANSPARENT } from "./palette";
import { parseSprite } from "./sprite";
import { SPRITES } from "./sprites";

describe("parseSprite", () => {
  it("maps dimensions and colors", () => {
    const sprite = parseSprite(["01", ".1"]);
    expect(sprite.width).toBe(2);
    expect(sprite.height).toBe(2);
    expect(sprite.pixels).toEqual([
      PALETTE["0"],
      PALETTE["1"],
      null,
      PALETTE["1"],
    ]);
  });

  it("preserves the transparent character as null", () => {
    expect(parseSprite([TRANSPARENT]).pixels).toEqual([null]);
  });

  it("rejects rows of differing width", () => {
    expect(() => parseSprite(["01", "0"])).toThrow(/equal width/);
  });

  it("rejects unknown palette characters", () => {
    expect(() => parseSprite(["0Z"])).toThrow(/Unknown palette/);
  });

  it("rejects empty sprites", () => {
    expect(() => parseSprite([])).toThrow(/no rows/);
    expect(() => parseSprite([""])).toThrow(/no columns/);
  });
});

describe("SPRITES", () => {
  it("every sprite parses cleanly", () => {
    for (const rows of Object.values(SPRITES)) {
      expect(() => parseSprite(rows)).not.toThrow();
    }
  });
});
