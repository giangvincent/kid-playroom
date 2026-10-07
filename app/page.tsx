"use client";

import { useRouter } from "next/navigation";
import { GameToggles } from "@/components/parent/GameToggles";
import { PinSetup } from "@/components/parent/PinSetup";
import { SettingsForm } from "@/components/parent/SettingsForm";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard } from "@/components/ui/PixelCard";
import { APP_NAME } from "@/lib/config";
import { useConfig } from "@/lib/store";

export default function ParentPage() {
  const { config, ready, update } = useConfig();
  const router = useRouter();

  if (!ready) {
    return null;
  }

  if (!config.pin) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-8 p-6">
        <h1 className="text-4xl font-bold">{APP_NAME}</h1>
        <PixelCard className="w-full max-w-sm">
          <PinSetup onSet={(pin) => update({ pin })} />
        </PixelCard>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-8 p-6">
      <h1 className="text-4xl font-bold">{APP_NAME}</h1>
      <PixelButton
        className="min-h-24 text-3xl"
        onPress={() => router.push("/play")}
      >
        Bắt đầu chơi
      </PixelButton>
      <SettingsForm />
      <GameToggles />
    </main>
  );
}
