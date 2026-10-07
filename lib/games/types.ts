import type { ComponentType } from "react";
import type { AssetName } from "@/lib/assets";

export type GameProps = {
  /** Called when a round is won; the shell celebrates and offers a replay. */
  onWin?: () => void;
};

export type GameDefinition = {
  id: string;
  title: string;
  icon: AssetName;
  Component: ComponentType<GameProps>;
};
