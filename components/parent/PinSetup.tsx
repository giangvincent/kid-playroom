"use client";

import { useState } from "react";
import { PinEntry } from "./PinEntry";

type PinSetupProps = {
  onSet: (pin: string) => void;
};

const ERROR_RESET_MS = 700;

export function PinSetup({ onSet }: PinSetupProps) {
  const [stage, setStage] = useState<"create" | "confirm">("create");
  const [first, setFirst] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleComplete(code: string) {
    if (stage === "create") {
      setFirst(code);
      setValue("");
      setStage("confirm");
      return;
    }

    if (code === first) {
      onSet(code);
      return;
    }

    setStage("create");
    setFirst("");
    setError("Mã PIN không khớp");
    window.setTimeout(() => {
      setValue("");
      setError(null);
    }, ERROR_RESET_MS);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-lg font-bold">
        {stage === "create" ? "Chọn mã PIN gồm 4 số" : "Nhập lại mã PIN"}
      </p>
      <PinEntry
        value={value}
        onChange={setValue}
        onComplete={handleComplete}
        errorText={error}
      />
    </div>
  );
}
