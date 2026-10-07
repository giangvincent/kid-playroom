import type { ComponentType } from "react";
import type { SpriteName } from "@/lib/pixel/sprites";

export type GameProps = {
  /** Called when a round is won; the shell celebrates and offers a replay. */
  onWin?: () => void;
};

export type GameDefinition = {
  id: string;
  title: string;
  icon: SpriteName;
  Component: ComponentType<GameProps>;
};
