import Link from "next/link";
import { PixelSprite } from "@/components/ui/PixelSprite";
import type { GameDefinition } from "@/lib/games/types";

export function GameCard({ game }: { game: GameDefinition }) {
  return (
    <Link
      href={`/play/${game.id}`}
      className="flex min-h-40 flex-col items-center justify-center gap-4 border-4 border-ink bg-paper p-6 shadow-[6px_6px_0_0_var(--color-ink)] transition-transform active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
    >
      <PixelSprite name={game.icon} size={88} />
      <span className="text-2xl font-bold">{game.title}</span>
    </Link>
  );
}
