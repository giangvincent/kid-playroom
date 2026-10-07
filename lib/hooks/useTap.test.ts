import { describe, expect, it } from "vitest";
import { isFreshClick, isPalm } from "./useTap";

describe("isPalm", () => {
  it("accepts finger-sized contact areas", () => {
    expect(isPalm(0.5, 0.5)).toBe(false);
    expect(isPalm(50, 60)).toBe(false);
    expect(isPalm(94, 95)).toBe(false);
  });

  it("rejects palm-sized contact areas", () => {
    expect(isPalm(95, 95)).toBe(true);
    expect(isPalm(120, 100)).toBe(true);
  });
});

describe("isFreshClick", () => {
  it("drops the derived click right after a pointer", () => {
    expect(isFreshClick(1000, 700)).toBe(false);
    expect(isFreshClick(1000, 501)).toBe(false);
  });

  it("passes keyboard clicks and late derived clicks", () => {
    expect(isFreshClick(1000, 0)).toBe(true);
    expect(isFreshClick(1000, 499)).toBe(true);
  });
});
