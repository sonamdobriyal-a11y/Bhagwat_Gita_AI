"use client";

import Image from "next/image";

export type AvatarSizeKey = "sm" | "md" | "lg" | "xl";

const SIZE_CLASS: Record<AvatarSizeKey, string> = {
  sm: "h-9 w-9",
  md: "h-14 w-14",
  lg: "h-28 w-28",
  /** Fills rail width; parent column sets max-width */
  xl: "aspect-square w-full max-w-[320px]",
};

const SIZE_HINT: Record<AvatarSizeKey, string> = {
  sm: "36px",
  md: "56px",
  lg: "112px",
  xl: "288px",
};

function CharacterPortrait({
  src,
  alt,
  size,
  variant,
  borderless = false,
}: {
  src: string;
  alt: string;
  size: AvatarSizeKey;
  variant: "gita-peacock" | "gita-brass";
  borderless?: boolean;
}) {
  const krishnaTone = variant === "gita-peacock";

  const frame =
    borderless || size === "xl"
      ? { boxShadow: "0 6px 28px rgba(15,23,42,0.1)" }
      : {
          border: `2px solid ${krishnaTone ? "rgba(51,65,85,0.3)" : "rgba(71,85,105,0.35)"}`,
          boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
          background: krishnaTone ? "rgba(51,65,85,0.06)" : "rgba(15,118,110,0.06)",
        };

  return (
    <div className={`relative flex-shrink-0 overflow-hidden rounded-full ${SIZE_CLASS[size]}`} style={frame}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-[center_35%]"
        sizes={SIZE_HINT[size]}
        priority={size === "xl" || size === "lg"}
      />
    </div>
  );
}

export function KrishnaAvatar({
  size = "sm",
  borderless,
}: {
  size?: AvatarSizeKey;
  borderless?: boolean;
}) {
  return (
    <CharacterPortrait
      src="/krishna.png"
      alt="Krishna"
      size={size}
      variant="gita-peacock"
      borderless={borderless ?? size === "xl"}
    />
  );
}

export function ArjunaAvatar({
  size = "sm",
  borderless,
}: {
  size?: AvatarSizeKey;
  borderless?: boolean;
}) {
  return (
    <CharacterPortrait
      src="/arjun.png"
      alt="Arjuna"
      size={size}
      variant="gita-brass"
      borderless={size === "xl" ? true : borderless}
    />
  );
}
