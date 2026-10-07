import { describe, expect, it } from "vitest";
import { buildAnimalScene, countTargets } from "./animalScene";

function seededRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

const POOL = ["cat", "dog", "fish", "bird", "frog", "rabbit"] as const;

describe("buildAnimalScene", () => {
  it("places exactly the expected number of targets", () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const scene = buildAnimalScene(POOL, seededRng(seed));
      expect(countTargets(scene.tiles, scene.target)).toBe(scene.targetCount);
    }
  });

  it("fills the board and only uses pool sprites", () => {
    const scene = buildAnimalScene(POOL, seededRng(3));
    expect(scene.tiles).toHaveLength(12);
    for (const tile of scene.tiles) {
      expect(POOL).toContain(tile.sprite);
    }
  });

  it("never repeats an id", () => {
    const ids = buildAnimalScene(POOL, seededRng(4)).tiles.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("is deterministic for a given RNG", () => {
    expect(buildAnimalScene(POOL, seededRng(8))).toEqual(
      buildAnimalScene(POOL, seededRng(8)),
    );
  });
});

describe("countTargets", () => {
  it("counts matching tiles only", () => {
    const tiles = [
      { id: "a", sprite: "cat" as const },
      { id: "b", sprite: "dog" as const },
      { id: "c", sprite: "cat" as const },
    ];
    expect(countTargets(tiles, "cat")).toBe(2);
    expect(countTargets(tiles, "dog")).toBe(1);
  });
});
