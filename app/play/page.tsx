import type { Metadata } from "next";
import { FullscreenButton } from "@/components/child/FullscreenButton";
import { HomeButton } from "@/components/child/HomeButton";
import { GameGrid } from "@/components/child/GameGrid";

export const metadata: Metadata = { title: "Chọn trò chơi" };

export default function PlayPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center gap-8 p-6">
      <header className="flex w-full max-w-4xl items-center gap-4 pl-12">
        <h1 className="flex-1 text-3xl font-bold">Chọn trò chơi</h1>
        <HomeButton />
        <FullscreenButton />
      </header>
      <GameGrid />
    </main>
  );
}
