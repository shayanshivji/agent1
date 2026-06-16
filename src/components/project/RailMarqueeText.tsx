"use client";

import clsx from "clsx";

interface RailMarqueeTextProps {
  text: string;
  className?: string;
}

interface RailMarqueeLabelsProps {
  children: React.ReactNode;
  className?: string;
}

function scrollRailLabels(container: HTMLElement | null, active: boolean) {
  if (!container) return;

  container.querySelectorAll<HTMLElement>("[data-marquee-inner]").forEach((inner) => {
    const track = inner.parentElement;
    if (!track) return;

    if (!active) {
      inner.style.transitionDuration = "0.35s";
      inner.style.transform = "";
      return;
    }

    const overflow = inner.scrollWidth - track.clientWidth;
    if (overflow > 0) {
      inner.style.transitionDuration = `${Math.max(1.8, overflow / 36)}s`;
      inner.style.transform = `translateX(-${overflow}px)`;
    }
  });
}

/** Label group inside a rail item (scroll triggered by parent item hover). */
export function RailMarqueeLabels({ children, className }: RailMarqueeLabelsProps) {
  return (
    <div className={clsx("min-w-0 flex-1", className)} data-rail-labels>
      {children}
    </div>
  );
}

export function activateRailLabelsFromItem(item: HTMLElement | null) {
  const labels = item?.querySelector<HTMLElement>("[data-rail-labels]");
  scrollRailLabels(labels ?? null, true);
}

export function deactivateRailLabelsFromItem(item: HTMLElement | null) {
  const labels = item?.querySelector<HTMLElement>("[data-rail-labels]");
  scrollRailLabels(labels ?? null, false);
}

export function RailMarqueeText({ text, className }: RailMarqueeTextProps) {
  return (
    <span className={clsx("rail-marquee-track", className)} data-marquee-track>
      <span className="rail-marquee-inner" data-marquee-inner>
        {text}
      </span>
    </span>
  );
}
