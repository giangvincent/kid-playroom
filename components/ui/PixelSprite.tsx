"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";
import { spriteToDataUrl } from "@/lib/pixel/render";
import { parseSprite } from "@/lib/pixel/sprite";
import { SPRITES, type SpriteName } from "@/lib/pixel/sprites";

type PixelSpriteProps = {
  name: SpriteName;
  size?: number;
  className?: string;
  alt?: string;
};

export function PixelSprite({
  name,
  size = 64,
  className,
  alt = "",
}: PixelSpriteProps) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    setSrc(spriteToDataUrl(name, parseSprite(SPRITES[name])));
  }, [name]);

  if (!src) {
    return (
      <span
        aria-hidden
        className={cx("inline-block", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={cx("pixelated select-none", className)}
    />
  );
}
