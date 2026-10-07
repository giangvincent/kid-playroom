"use client";

import { PixelSprite } from "@/components/ui/PixelSprite";
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
      <ul className="flex flex-col gap-3">
        {GAMES.map((game) => {
          const enabled = !config.disabledGames.includes(game.id);
          return (
            <li key={game.id}>
              <button
                type="button"
                onClick={() => toggle(game.id)}
                className={cx(
                  "flex min-h-16 w-full items-center gap-4 border-4 border-ink px-5",
                  "shadow-[4px_4px_0_0_var(--color-ink)]",
                  enabled ? "bg-paper" : "bg-mist",
                )}
              >
                <PixelSprite name={game.icon} size={40} />
                <span className="text-lg font-bold">{game.title}</span>
                <span className="ml-auto text-lg font-bold">
                  {enabled ? "Bật" : "Tắt"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
