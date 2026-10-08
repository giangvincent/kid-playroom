export const BOARD_SIZES = [4, 6, 9, 12, 16] as const;

export type BoardSize = (typeof BOARD_SIZES)[number];

const LAYOUTS: Record<BoardSize, { cols: number; rows: number }> = {
  4: { cols: 2, rows: 2 },
  6: { cols: 3, rows: 2 },
  9: { cols: 3, rows: 3 },
  12: { cols: 4, rows: 3 },
  16: { cols: 4, rows: 4 },
};

const DEFAULT_SIZE: BoardSize = 12;

export function isBoardSize(value: unknown): value is BoardSize {
  return BOARD_SIZES.includes(value as BoardSize);
}

export function boardLayout(size: number): { cols: number; rows: number } {
  return isBoardSize(size) ? LAYOUTS[size] : LAYOUTS[DEFAULT_SIZE];
}

/** Items to find on a board of `tileCount` tiles: smaller boards get fewer. */
export function targetCountFor(tileCount: number): number {
  return Math.max(1, Math.round(tileCount / 4));
}
