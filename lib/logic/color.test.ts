import { describe, expect, it } from "vitest";
import { buildColorRound, isTargetColor, type ColorOption } from "./color";

function seededRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

const COLORS: ColorOption[] = [
  { name: "red", hex: "#ff004d" },
  { name: "green", hex: "#00e436" },
  { name: "blue", hex: "#29adff" },
  { name: "yellow", hex: "#ffec27" },
  { name: "purple", hex: "#83769c" },
];

describe("buildColorRound", () => {
  it("returns the requested number of distinct options", () => {
    const round = buildColorRound(COLORS, 4, seededRng(1));
    expect(round.options).toHaveLength(4);
    expect(new Set(round.options.map((o) => o.name)).size).toBe(4);
  });

  it("always includes the target among the options", () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const round = buildColorRound(COLORS, 3, seededRng(seed));
      expect(round.options.map((o) => o.name)).toContain(round.target.name);
    }
  });

  it("is deterministic for a given RNG", () => {
    expect(buildColorRound(COLORS, 3, seededRng(5))).toEqual(
      buildColorRound(COLORS, 3, seededRng(5)),
    );
  });
});

describe("isTargetColor", () => {
  it("matches by name only", () => {
    const round = buildColorRound(COLORS, 3, seededRng(2));
    expect(isTargetColor(round, round.target)).toBe(true);
    const other = round.options.find((o) => o.name !== round.target.name);
    expect(other && isTargetColor(round, other)).toBe(false);
  });
});
