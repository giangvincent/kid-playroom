import { describe, expect, it } from "vitest";
import { buildSizeRound, isCorrectChoice, SIZE_STEPS } from "./size";

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
