import Image from "next/image";
import Link from "next/link";

type SiteLogoProps = {
  href?: string;
  className?: string;
  showSubtitle?: boolean;
  onClick?: () => void;
};

export function SiteLogo({
  href = "/",
  className = "",
  showSubtitle = false,
  onClick,
}: SiteLogoProps) {
  const inner = (
    <>
      <Image
        src="/flute.png"
        alt="Bhagavad Gita AI"
        width={1536}
        height={1024}
        className="h-9 w-auto max-w-[min(100%,11rem)] object-contain sm:h-10 sm:max-w-[12.5rem]"
        priority
      />
      {showSubtitle ? (
        <span className="hidden font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500 lg:block">
          AI companion
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`group flex min-w-0 items-center gap-3 ${className}`}
        onClick={onClick}
      >
        {inner}
      </Link>
    );
  }

  return <span className={`group flex min-w-0 items-center gap-3 ${className}`}>{inner}</span>;
}
