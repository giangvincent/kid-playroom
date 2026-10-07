import { ASSETS, type AssetName } from "@/lib/assets";
import { cx } from "@/lib/cx";

type GameImageProps = {
  name: AssetName;
  size?: number;
  className?: string;
  alt?: string;
};

export function GameImage({
  name,
  size = 64,
  className,
  alt = "",
}: GameImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ASSETS[name]}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={cx("select-none object-contain", className)}
    />
  );
}
