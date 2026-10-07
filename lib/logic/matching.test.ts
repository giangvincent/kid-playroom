import { describe, expect, it } from "vitest";
import { buildMatchingBoard, isBoardCleared, isMatch } from "./matching";

function seededRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

const POOL = ["circle", "square", "triangle", "diamond", "star"] as const;

describe("buildMatchingBoard", () => {
  it("creates two tiles per chosen pair", () => {
    const board = buildMatchingBoard(POOL, 3, seededRng(1));
    expect(board).toHaveLength(6);
    const counts = new Map<string, number>();
    for (const tile of board) {
      counts.set(tile.sprite, (counts.get(tile.sprite) ?? 0) + 1);
    }
    expect([...counts.values()]).toEqual([2, 2, 2]);
  });

  it("only draws sprites from the pool", () => {
    const board = buildMatchingBoard(POOL, 4, seededRng(2));
    for (const tile of board) {
      expect(POOL).toContain(tile.sprite);
    }
  });

  it("never repeats an id", () => {
    const ids = buildMatchingBoard(POOL, 5, seededRng(3)).map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("is deterministic for a given RNG", () => {
    expect(buildMatchingBoard(POOL, 3, seededRng(9))).toEqual(
      buildMatchingBoard(POOL, 3, seededRng(9)),
    );
  });
});

describe("isMatch", () => {
  const a = { id: "circle-a-0", sprite: "circle" as const };
  const b = { id: "circle-b-0", sprite: "circle" as const };
  const c = { id: "star-a-1", sprite: "star" as const };

  it("matches same-sprite distinct tiles", () => {
    expect(isMatch(a, b)).toBe(true);
  });

  it("does not match a tile with itself", () => {
    expect(isMatch(a, a)).toBe(false);
  });

  it("does not match different sprites", () => {
    expect(isMatch(a, c)).toBe(false);
  });
});

describe("isBoardCleared", () => {
  it("is true only when every tile is matched", () => {
    const board = buildMatchingBoard(POOL, 2, seededRng(4));
    expect(isBoardCleared(board, new Set())).toBe(false);
    expect(isBoardCleared(board, new Set(board.slice(0, 3).map((t) => t.id)))).toBe(
      false,
    );
    expect(isBoardCleared(board, new Set(board.map((t) => t.id)))).toBe(true);
  });
});
