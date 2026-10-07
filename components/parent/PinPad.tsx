"use client";

import { useState } from "react";
import { PinEntry } from "./PinEntry";

type PinPadProps = {
  expected: string;
  onSuccess: () => void;
  onCancel: () => void;
};

const RESET_DELAY_MS = 500;

export function PinPad({ expected, onSuccess, onCancel }: PinPadProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  function handleComplete(code: string) {
    if (code === expected) {
      onSuccess();
      return;
    }
    setError(true);
    window.setTimeout(() => {
      setValue("");
      setError(false);
    }, RESET_DELAY_MS);
  }

  return (
    <PinEntry
      value={value}
      onChange={setValue}
      onComplete={handleComplete}
      onCancel={onCancel}
      errorText={error ? "Sai mã PIN" : null}
    />
  );
}
