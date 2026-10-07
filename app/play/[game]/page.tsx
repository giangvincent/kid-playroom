import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameShell } from "@/components/child/GameShell";
import { GAMES, getGame } from "@/lib/games/registry";

export function generateStaticParams() {
  return GAMES.map((game) => ({ game: game.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game } = await params;
  const definition = getGame(game);
  return {
    title: definition ? `${definition.title} · Phòng Chơi` : "Phòng Chơi",
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game } = await params;
  if (!getGame(game)) {
    notFound();
  }
  return <GameShell gameId={game} />;
}
