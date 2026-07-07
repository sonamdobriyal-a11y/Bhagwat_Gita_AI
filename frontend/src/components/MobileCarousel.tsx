"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type MobileCarouselProps = {
  children: ReactNode[];
  /** Accessible label for the carousel region */
  ariaLabel: string;
  /** Tailwind class for each slide wrapper (width on mobile) */
  slideClassName?: string;
  /** Show dot indicators (default true) */
  showDots?: boolean;
  /** Show prev/next arrows on mobile (default true) */
  showArrows?: boolean;
  /** Breakpoint below which carousel is active (default lg = 1024px) */
  mobileMaxWidth?: number;
  className?: string;
};

export function MobileCarousel({
  children,
  ariaLabel,
  slideClassName = "w-[85vw] max-w-[320px] flex-shrink-0 snap-center",
  showDots = true,
  showArrows = true,
  mobileMaxWidth = 1024,
  className = "",
}: MobileCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const count = children.length;

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${mobileMaxWidth - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [mobileMaxWidth]);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slides = track.querySelectorAll<HTMLElement>("[data-carousel-slide]");
    const slide = slides[index];
    if (!slide) return;
    const offset = slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
    track.scrollTo({ left: offset, behavior: "smooth" });
    setActive(index);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !isMobile) return;

    const onScroll = () => {
      const slides = track.querySelectorAll<HTMLElement>("[data-carousel-slide]");
      if (!slides.length) return;
      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      slides.forEach((slide, i) => {
        const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
        const dist = Math.abs(center - slideCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setActive(closest);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [isMobile, count]);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      {showArrows && count > 1 && (
        <div className="mb-3 flex items-center justify-between px-1">
          <button
            type="button"
            aria-label="Previous slide"
            disabled={active === 0}
            onClick={() => scrollToIndex(Math.max(0, active - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gita-line/70 bg-white/90 text-gita-earth shadow-sm transition hover:border-gita-saffron/40 disabled:opacity-30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-mono text-[10px] uppercase tracking-wider text-gita-muted">
            {active + 1} / {count}
          </span>
          <button
            type="button"
            aria-label="Next slide"
            disabled={active === count - 1}
            onClick={() => scrollToIndex(Math.min(count - 1, active + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gita-line/70 bg-white/90 text-gita-earth shadow-sm transition hover:border-gita-saffron/40 disabled:opacity-30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        className="carousel-track -mx-5 flex gap-4 overflow-x-auto px-5 pb-2 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {children.map((child, i) => (
          <div
            key={i}
            data-carousel-slide
            className={slideClassName}
            aria-hidden={i !== active}
          >
            {child}
          </div>
        ))}
      </div>

      {showDots && count > 1 && (
        <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label={`${ariaLabel} slides`}>
          {children.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`rounded-full transition-all ${
                i === active ? "h-2 w-6 bg-gita-saffron" : "h-2 w-2 bg-gita-line hover:bg-gita-saffron/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
