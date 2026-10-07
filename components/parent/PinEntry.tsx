"use client";

import { PixelButton } from "@/components/ui/PixelButton";
import { cx } from "@/lib/cx";
import { PIN_LENGTH } from "@/lib/config";

type PinEntryProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete: (code: string) => void;
  onCancel?: () => void;
  errorText?: string | null;
};

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function PinEntry({
  value,
  onChange,
  onComplete,
  onCancel,
  errorText,
}: PinEntryProps) {
  const full = value.length >= PIN_LENGTH;

  function press(digit: string) {
    if (full) {
      return;
    }
    const next = value + digit;
    onChange(next);
    if (next.length === PIN_LENGTH) {
      onComplete(next);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3">
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
          <span
            key={index}
            className={cx(
              "h-5 w-5 border-2 border-ink",
              index < value.length && "bg-ink",
            )}
          />
        ))}
      </div>
      <p
        aria-hidden={!errorText}
        className={cx(
          "h-6 text-lg font-bold",
          errorText ? "text-danger" : "text-transparent",
        )}
      >
        {errorText ?? "\u00A0"}
      </p>
      <div className="grid grid-cols-3 gap-3">
        {DIGITS.map((digit) => (
          <PixelButton
            key={digit}
            onPress={() => press(digit)}
            className="h-16 w-16 px-0 text-2xl"
          >
            {digit}
          </PixelButton>
        ))}
        {onCancel ? (
          <PixelButton
            tone="accent"
            onPress={onCancel}
            className="h-16 w-16 px-0 text-xl"
            label="Huỷ"
          >
            ✕
          </PixelButton>
        ) : (
          <span />
        )}
        <PixelButton
          onPress={() => press("0")}
          className="h-16 w-16 px-0 text-2xl"
        >
          0
        </PixelButton>
        <PixelButton
          tone="accent"
          onPress={() => onChange(value.slice(0, -1))}
          className="h-16 w-16 px-0 text-xl"
          label="Xoá"
        >
          ⌫
        </PixelButton>
      </div>
    </div>
  );
}
