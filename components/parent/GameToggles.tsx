"use client";

import { GameImage } from "@/components/ui/GameImage";
import { cx } from "@/lib/cx";
import { GAMES } from "@/lib/games/registry";
import { useConfig } from "@/lib/store";

export function GameToggles() {
  const { config, update } = useConfig();

  function toggle(id: string) {
    const isEnabled = !config.disabledGames.includes(id);
    update({
      disabledGames: isEnabled
        ? [...config.disabledGames, id]
        : config.disabledGames.filter((game) => game !== id),
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Trò chơi</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {GAMES.map((game) => {
          const enabled = !config.disabledGames.includes(game.id);
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => toggle(game.id)}
              aria-pressed={enabled}
              className={cx(
                "flex min-h-32 flex-col items-center justify-center gap-3 border-4 border-ink p-4",
                "shadow-[4px_4px_0_0_var(--color-ink)] transition-transform active:translate-y-[2px]",
                enabled ? "bg-paper" : "bg-mist",
              )}
            >
              <GameImage name={game.icon} size={48} />
              <span className="text-center text-lg font-bold">{game.title}</span>
              <span className="text-base font-bold">
                {enabled ? "Bật" : "Tắt"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
