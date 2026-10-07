"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Celebration } from "./Celebration";
import { FullscreenButton } from "./FullscreenButton";
import { PixelButton } from "@/components/ui/PixelButton";
import { GameImage } from "@/components/ui/GameImage";
import { playCue } from "@/lib/audio";
import { getGame } from "@/lib/games/registry";
import { useConfig } from "@/lib/store";

export function GameShell({ gameId }: { gameId: string }) {
  const game = getGame(gameId);
  const { config } = useConfig();
  const router = useRouter();
  const [round, setRound] = useState(0);
  const [won, setWon] = useState(false);

  const handleWin = useCallback(() => {
    playCue("complete", config.soundEnabled);
    setWon(true);
  }, [config.soundEnabled]);

  const replay = useCallback(() => {
    setWon(false);
    setRound((value) => value + 1);
  }, []);

  if (!game) {
    return null;
  }

  const { Component, title, icon } = game;

  return (
    <div className="flex min-h-dvh flex-col gap-4 p-4">
      <header className="flex items-center gap-4 pl-16">
        <PixelButton
          tone="accent"
          className="px-4 text-base"
          onPress={() => router.push("/play")}
        >
          Quay lại
        </PixelButton>
        <GameImage name={icon} size={48} />
        <h1 className="truncate text-2xl font-bold">{title}</h1>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <FullscreenButton />
          <PixelButton
            className="px-4 text-base"
            onPress={replay}
            label="Chơi lại"
          >
            Chơi lại
          </PixelButton>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <Component key={round} onWin={handleWin} />
      </main>
      <Celebration show={won} onReplay={replay} />
    </div>
  );
}
