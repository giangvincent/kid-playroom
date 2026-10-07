"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PinPad } from "@/components/parent/PinPad";
import { Modal } from "@/components/ui/Modal";
import { useConfig } from "@/lib/store";

type ParentGateContextValue = {
  /** Ask the parent for the PIN, then run `action` if it is correct. */
  requestUnlock: (action: () => void) => void;
};

const ParentGateContext = createContext<ParentGateContextValue | null>(null);

export function ParentGateProvider({ children }: { children: ReactNode }) {
  const { config } = useConfig();
  const actionRef = useRef<(() => void) | null>(null);
  const [open, setOpen] = useState(false);
  const pin = config.pin;

  const requestUnlock = useCallback((action: () => void) => {
    actionRef.current = action;
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    actionRef.current = null;
    setOpen(false);
  }, []);

  const succeed = useCallback(() => {
    const action = actionRef.current;
    actionRef.current = null;
    setOpen(false);
    action?.();
  }, []);

  const value = useMemo(() => ({ requestUnlock }), [requestUnlock]);

  return (
    <ParentGateContext.Provider value={value}>
      {children}
      <Modal open={open && pin !== null}>
        <div className="flex flex-col items-center gap-5">
          <h2 className="text-2xl font-bold">Mã PIN của bố mẹ</h2>
          {pin !== null && (
            <PinPad expected={pin} onSuccess={succeed} onCancel={close} />
          )}
        </div>
      </Modal>
    </ParentGateContext.Provider>
  );
}

export function useParentGate(): ParentGateContextValue {
  const context = useContext(ParentGateContext);
  if (!context) {
    throw new Error("useParentGate must be used within a ParentGateProvider");
  }
  return context;
}
