"use client";

import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type Tone = "primary" | "danger" | "accent";

const TONES: Record<Tone, string> = {
  primary: "bg-primary text-ink",
  danger: "bg-danger text-paper",
  accent: "bg-accent text-ink",
};

type PixelButtonProps = {
  children: ReactNode;
  onPress: () => void;
  tone?: Tone;
  className?: string;
  disabled?: boolean;
  label?: string;
};

export function PixelButton({
  children,
  onPress,
  tone = "primary",
  className,
  disabled,
  label,
}: PixelButtonProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      aria-label={label}
      className={cx(
        "inline-flex min-h-16 min-w-16 items-center justify-center border-4 border-ink px-6 py-3 text-xl font-bold",
        "shadow-[4px_4px_0_0_var(--color-ink)] transition-transform",
        "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        "disabled:opacity-50",
        TONES[tone],
        className,
      )}
    >
      {children}
    </button>
  );
}
