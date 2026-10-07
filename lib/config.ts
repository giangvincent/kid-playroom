export const APP_NAME = "Phòng Chơi";

export const PIN_LENGTH = 4;

export type AppConfig = {
  /** Parent exit PIN, or `null` until one is set. */
  pin: string | null;
  soundEnabled: boolean;
  /** Game ids turned off in Parent Mode. Empty means every game is enabled. */
  disabledGames: string[];
};

export const DEFAULT_CONFIG: AppConfig = {
  pin: null,
  soundEnabled: true,
  disabledGames: [],
};
