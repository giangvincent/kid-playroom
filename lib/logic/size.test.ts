import { describe, expect, it } from "vitest";
import {
  buildCompareRound,
  buildSizeRound,
  isCorrectChoice,
  SIZE_STEPS,
} from "./size";

function seededRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

const POOL = ["circle", "triangle", "star"] as const;

describe("buildSizeRound", () => {
  it("marks the largest item as correct in biggest mode", () => {
    const round = buildSizeRound(POOL, "biggest", seededRng(1));
    const correct = round.items.find((item) => item.id === round.correctId);
    expect(correct?.size).toBe(Math.max(...SIZE_STEPS));
  });

  it("marks the smallest item as correct in smallest mode", () => {
    const round = buildSizeRound(POOL, "smallest", seededRng(2));
    const correct = round.items.find((item) => item.id === round.correctId);
    expect(correct?.size).toBe(Math.min(...SIZE_STEPS));
  });

  it("shuffles all size steps", () => {
    const round = buildSizeRound(POOL, "biggest", seededRng(3));
    expect(round.items.map((i) => i.size).sort((a, b) => a - b)).toEqual([
      ...SIZE_STEPS,
    ]);
  });

  it("draws the sprite from the pool", () => {
    const round = buildSizeRound(POOL, "biggest", seededRng(4));
    expect(POOL).toContain(round.sprite);
  });

  it("is deterministic for a given RNG", () => {
    expect(buildSizeRound(POOL, "smallest", seededRng(6))).toEqual(
      buildSizeRound(POOL, "smallest", seededRng(6)),
    );
  });
});

describe("isCorrectChoice", () => {
  it("only accepts the correct id", () => {
    const round = buildSizeRound(POOL, "biggest", seededRng(5));
    expect(isCorrectChoice(round, round.correctId)).toBe(true);
    const wrong = round.items.find((item) => item.id !== round.correctId);
    expect(wrong && isCorrectChoice(round, wrong.id)).toBe(false);
  });
});

describe("buildCompareRound", () => {
  it("shows exactly two shapes, at least two steps apart", () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const round = buildCompareRound(POOL, "bigger", seededRng(seed));
      expect(round.items).toHaveLength(2);
      const [a, b] = round.items.map((item) => item.size);
      expect(Math.abs(a - b)).toBeGreaterThanOrEqual(2);
    }
  });

  it("marks the larger shape correct in bigger mode", () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const round = buildCompareRound(POOL, "bigger", seededRng(seed));
      const correct = round.items.find((item) => item.id === round.correctId);
      expect(correct?.size).toBe(Math.max(...round.items.map((i) => i.size)));
    }
  });

  it("marks the smaller shape correct in smaller mode", () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const round = buildCompareRound(POOL, "smaller", seededRng(seed));
      const correct = round.items.find((item) => item.id === round.correctId);
      expect(correct?.size).toBe(Math.min(...round.items.map((i) => i.size)));
    }
  });

  it("keeps the mode and draws the sprite from the pool", () => {
    const round = buildCompareRound(POOL, "smaller", seededRng(11));
    expect(round.mode).toBe("smaller");
    expect(POOL).toContain(round.sprite);
  });
});
