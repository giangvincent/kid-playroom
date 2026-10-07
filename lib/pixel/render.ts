import type { Sprite } from "./sprite";

const cache = new Map<string, string>();

export function spriteToDataUrl(key: string, sprite: Sprite): string {
  if (typeof document === "undefined") {
    return "";
  }

  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const canvas = document.createElement("canvas");
  canvas.width = sprite.width;
  canvas.height = sprite.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return "";
  }

  sprite.pixels.forEach((color, index) => {
    if (!color) {
      return;
    }
    ctx.fillStyle = color;
    ctx.fillRect(index % sprite.width, Math.floor(index / sprite.width), 1, 1);
  });

  const url = canvas.toDataURL("image/png");
  cache.set(key, url);
  return url;
}
