/**
 * Homepage layout: one outer container, two inner columns, optional carousel.
 *
 * CSS Grid with 3 equal tracks inside a centered, max-width frame:
 *   left  → col-span-2  (2/3 of the container width)
 *   right → col-span-1  (1/3 of the container width)
 *
 * Carousel:
 *   Pass `slides` (an array of { left, right } pairs). Arrow buttons
 *   change which pair is showing. `useState` stores the current index;
 *   clicking next/prev wraps around with modulo.
 *
 * Usage (one pair, no arrows):
 *   <HomepageContainer left={<Logo />} right={<p>Featured</p>} />
 *
 * Usage (carousel):
 *   <HomepageContainer
 *     slides={[
 *       { left: <Logo />, right: <p>Slide 1</p> },
 *       { left: <p>Sale</p>, right: <p>Slide 2</p> },
 *     ]}
 *   />
 */

import { useState, type HTMLAttributes, type ReactNode } from "react";

export type HomepageAlternate = "main" | "alternate";

/** One carousel frame: the 2/3 column + the 1/3 column. */
export type HomepageSlide = {
  left?: ReactNode;
  right?: ReactNode;
};

export type HomepageContainerProps = {
  /** Single-slide shortcut when you do not need a carousel. */
  left?: ReactNode;
  right?: ReactNode;
  /**
   * Multiple left/right pairs. When this has 2+ items, prev/next arrows
   * appear. Takes priority over `left` / `right`.
   */
  slides?: HomepageSlide[];
  className?: string;
  alternate?: HomepageAlternate;
} & Omit<HTMLAttributes<HTMLDivElement>, "className" | "children">;

const alternateClasses: Record<HomepageAlternate, string> = {
  main: ["bg-stone-900 text-stone-50"].join(" "),
  alternate: ["bg-transparent text-stone-900"].join(" "),
};

const arrowButtonClasses = [
  "absolute top-1/2 z-10 -translate-y-1/2",
  "flex h-10 w-10 items-center justify-center",
  "rounded-full",
  "bg-stone-900/80 text-stone-50",
  "hover:bg-stone-900",
  "cursor-pointer",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600",
].join(" ");

export function HomepageContainer({
  left,
  right,
  slides,
  className = "",
  alternate = "alternate",
  ...rest
}: HomepageContainerProps) {
  // Prefer `slides`; otherwise wrap the single left/right pair into one slide.
  const pairs: HomepageSlide[] =
    slides && slides.length > 0 ? slides : [{ left, right }];

  // Current frame in the carousel (0-based). Changing this re-renders the pair.
  const [index, setIndex] = useState(0);

  // Guard against a stale index if `slides` later shrinks.
  const safeIndex = index % pairs.length;
  const current = pairs[safeIndex] ?? pairs[0];
  const showArrows = pairs.length > 1;

  function goPrev() {
    // + length before % keeps the result non-negative when index is 0.
    setIndex((i) => (i - 1 + pairs.length) % pairs.length);
  }

  function goNext() {
    setIndex((i) => (i + 1) % pairs.length);
  }

  return (
    <div
      className={[
        "relative mx-auto grid w-full max-w-6xl grid-cols-3 px-4",
        alternateClasses[alternate],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {showArrows ? (
        <button
          type="button"
          aria-label="Previous slide"
          className={`${arrowButtonClasses} left-2`}
          onClick={goPrev}
        >
          ‹
        </button>
      ) : null}

      <div className="col-span-2 min-w-0">{current.left}</div>
      <div className="col-span-1 min-w-0">{current.right}</div>

      {showArrows ? (
        <button
          type="button"
          aria-label="Next slide"
          className={`${arrowButtonClasses} right-2`}
          onClick={goNext}
        >
          ›
        </button>
      ) : null}
    </div>
  );
}
