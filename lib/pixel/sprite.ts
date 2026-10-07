import { PALETTE, TRANSPARENT } from "./palette";

export type Sprite = {
  width: number;
  height: number;
  /** Row-major color strings; `null` means transparent. */
  pixels: Array<string | null>;
};

export function parseSprite(rows: readonly string[]): Sprite {
  if (rows.length === 0) {
    throw new Error("Sprite has no rows");
  }

  const width = rows[0].length;
  if (width === 0) {
    throw new Error("Sprite has no columns");
  }

  const pixels: Array<string | null> = [];
  for (const row of rows) {
    if (row.length !== width) {
      throw new Error(
        `Sprite rows must be equal width (expected ${width}, got ${row.length})`,
      );
    }
    for (const char of row) {
      if (char === TRANSPARENT) {
        pixels.push(null);
        continue;
      }
      const color = PALETTE[char];
      if (!color) {
        throw new Error(`Unknown palette character "${char}"`);
      }
      pixels.push(color);
    }
  }

  return { width, height: rows.length, pixels };
}
