import { describe, expect, it } from "vitest";
import {
  BOARD_SIZES,
  boardLayout,
  isBoardSize,
  targetCountFor,
} from "./boardSize";

describe("BOARD_SIZES", () => {
  it("offers exactly 4, 6, 9, 12 and 16", () => {
    expect([...BOARD_SIZES]).toEqual([4, 6, 9, 12, 16]);
  });
});

describe("isBoardSize", () => {
  it("accepts every offered size and rejects anything else", () => {
    for (const size of BOARD_SIZES) {
      expect(isBoardSize(size)).toBe(true);
    }
    for (const value of [0, 1, 5, 8, 20, "12", null, undefined, Number.NaN]) {
      expect(isBoardSize(value)).toBe(false);
    }
  });
});

describe("boardLayout", () => {
  it("maps every size to a grid that holds exactly that many tiles", () => {
    for (const size of BOARD_SIZES) {
      const { cols, rows } = boardLayout(size);
      expect(cols * rows).toBe(size);
    }
  });

  it("falls back to the default layout for an unknown size", () => {
    expect(boardLayout(7)).toEqual(boardLayout(12));
  });
});

describe("targetCountFor", () => {
  it("scales the number of targets with the board", () => {
    expect(BOARD_SIZES.map(targetCountFor)).toEqual([1, 2, 2, 3, 4]);
  });

  it("never returns fewer than one target", () => {
    expect(targetCountFor(0)).toBe(1);
    expect(targetCountFor(2)).toBe(1);
  });
});
