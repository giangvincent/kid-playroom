import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CONFIG } from "./config";
import { loadConfig, parseConfig, saveConfig } from "./storage";

function fakeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parseConfig", () => {
  it("accepts a valid config", () => {
    const parsed = parseConfig({
      pin: "1234",
      soundEnabled: true,
      disabledGames: ["memory"],
    });
    expect(parsed).toEqual({
      pin: "1234",
      soundEnabled: true,
      disabledGames: ["memory"],
    });
  });

  it("fills missing fields from defaults", () => {
    expect(parseConfig({})).toEqual(DEFAULT_CONFIG);
  });

  it("rejects a malformed PIN", () => {
    expect(parseConfig({ pin: "12" }).pin).toBeNull();
    expect(parseConfig({ pin: "abcd" }).pin).toBeNull();
    expect(parseConfig({ pin: 1234 }).pin).toBeNull();
  });

  it("rejects wrong field types", () => {
    expect(parseConfig({ soundEnabled: "yes" }).soundEnabled).toBe(true);
    expect(parseConfig({ disabledGames: "memory" }).disabledGames).toEqual([]);
    expect(parseConfig({ disabledGames: [1, 2] }).disabledGames).toEqual([]);
  });

  it("falls back for non-objects", () => {
    expect(parseConfig(null)).toEqual(DEFAULT_CONFIG);
    expect(parseConfig("nope")).toEqual(DEFAULT_CONFIG);
  });
});

describe("loadConfig / saveConfig", () => {
  it("returns defaults when no window is available", () => {
    expect(loadConfig()).toEqual(DEFAULT_CONFIG);
  });

  it("round-trips a saved config", () => {
    vi.stubGlobal("window", { localStorage: fakeStorage() });
    const config = { pin: "4321", soundEnabled: true, disabledGames: ["color"] };
    saveConfig(config);
    expect(loadConfig()).toEqual(config);
  });

  it("falls back to defaults on corrupt JSON", () => {
    const storage = fakeStorage();
    storage.setItem("playroom.config.v1", "{not json");
    vi.stubGlobal("window", { localStorage: storage });
    expect(loadConfig()).toEqual(DEFAULT_CONFIG);
  });
});
