"use client";

import { FindGame } from "@/components/games/find/FindGame";
import { VEHICLE_NAMES } from "@/lib/assets";
import type { GameProps } from "@/lib/games/types";
import { vehicleLabel } from "@/lib/labels";

export function VehicleGame(props: GameProps) {
  return <FindGame {...props} pool={VEHICLE_NAMES} label={vehicleLabel} />;
}
