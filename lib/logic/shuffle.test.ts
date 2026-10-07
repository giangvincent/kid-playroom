import { describe, expect, it } from "vitest";
import { shuffle } from "./shuffle";

function seededRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

describe("shuffle", () => {
  it("returns a permutation of the input", () => {
    const input = [1, 2, 3, 4, 5];
    const output = shuffle(input, seededRng(1));
    expect(output).toHaveLength(input.length);
    expect([...output].sort((a, b) => a - b)).toEqual(input);
  });

  it("does not mutate the input", () => {
    const input = [1, 2, 3, 4, 5];
    shuffle(input, seededRng(2));
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it("is deterministic for a given RNG", () => {
    expect(shuffle([1, 2, 3, 4, 5], seededRng(7))).toEqual(
      shuffle([1, 2, 3, 4, 5], seededRng(7)),
    );
  });

  it("handles empty and single-item input", () => {
    expect(shuffle([], seededRng(3))).toEqual([]);
    expect(shuffle(["only"], seededRng(3))).toEqual(["only"]);
  });
});
