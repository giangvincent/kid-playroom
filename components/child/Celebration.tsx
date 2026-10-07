"use client";

import { PixelButton } from "@/components/ui/PixelButton";
import { PixelSprite } from "@/components/ui/PixelSprite";
import { Modal } from "@/components/ui/Modal";

type CelebrationProps = {
  show: boolean;
  onReplay: () => void;
};

export function Celebration({ show, onReplay }: CelebrationProps) {
  return (
    <Modal open={show}>
      <div className="flex flex-col items-center gap-5 text-center">
        <PixelSprite name="star" size={112} />
        <p className="text-3xl font-bold">Hoan hô!</p>
        <PixelButton onPress={onReplay}>Chơi lại</PixelButton>
      </div>
    </Modal>
  );
}
