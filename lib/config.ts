export const APP_NAME = "Phòng Chơi";

export const PIN_LENGTH = 4;

export type AppConfig = {
  /** Parent exit PIN, or `null` until one is set. */
  pin: string | null;
  soundEnabled: boolean;
  /** Game ids turned off in Parent Mode. Empty means every game is enabled. */
  disabledGames: string[];
  /** Tiles per board in the find-games (animal / rau quả / xe cộ). */
  findBoardSize: number;
};

export const DEFAULT_CONFIG: AppConfig = {
  pin: null,
  soundEnabled: true,
  disabledGames: [],
  findBoardSize: 12,
};
