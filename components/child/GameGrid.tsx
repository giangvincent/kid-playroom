"use client";

import { GameCard } from "./GameCard";
import { GAMES } from "@/lib/games/registry";
import { useConfig } from "@/lib/store";

export function GameGrid() {
  const { config, ready } = useConfig();
  const games = GAMES.filter((game) => !config.disabledGames.includes(game.id));

  if (!ready) {
    return null;
  }

  if (games.length === 0) {
    return <p className="text-2xl">Chưa bật trò chơi nào.</p>;
  }

  return (
    <div className="grid w-full max-w-4xl grid-cols-2 gap-6 sm:grid-cols-3">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
