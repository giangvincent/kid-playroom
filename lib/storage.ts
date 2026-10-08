import { DEFAULT_CONFIG, PIN_LENGTH, type AppConfig } from "./config";
import { isBoardSize } from "./logic/boardSize";

const STORAGE_KEY = "playroom.config.v1";

function isPin(value: unknown): value is string | null {
  if (value === null) {
    return true;
  }
  return typeof value === "string" && new RegExp(`^\\d{${PIN_LENGTH}}$`).test(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/** Validate an untrusted value (e.g. parsed localStorage) into a safe config. */
export function parseConfig(raw: unknown): AppConfig {
  if (typeof raw !== "object" || raw === null) {
    return { ...DEFAULT_CONFIG };
  }

  const value = raw as Record<string, unknown>;
  return {
    pin: isPin(value.pin) ? value.pin : DEFAULT_CONFIG.pin,
    soundEnabled:
      typeof value.soundEnabled === "boolean"
        ? value.soundEnabled
        : DEFAULT_CONFIG.soundEnabled,
    disabledGames: isStringArray(value.disabledGames)
      ? value.disabledGames
      : DEFAULT_CONFIG.disabledGames,
    findBoardSize: isBoardSize(value.findBoardSize)
      ? value.findBoardSize
      : DEFAULT_CONFIG.findBoardSize,
  };
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export function loadConfig(): AppConfig {
  const storage = getStorage();
  if (!storage) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_CONFIG };
    }
    return parseConfig(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: AppConfig): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage can be unavailable (private mode) or full; settings just won't persist.
  }
}
