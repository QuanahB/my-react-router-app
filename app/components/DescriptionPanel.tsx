/**
 * Side panel for HomepageContainer's 1/3 column: four small thumbnails
 * in a 2×2 grid, with description text underneath.
 *
 *   <HomepageContainer
 *     left={<ProductImage />}
 *     right={
 *       <DescriptionPanel
 *         images={[{ src: still, alt: "Front" }, ...]}
 *         text="Linen shirt — breathable summer staple."
 *       />
 *     }
 *   />
 *
 * `images` should have up to 4 items. Fewer than 4 still layout in 2 columns;
 * extras beyond 4 are ignored.
 */

import type { HTMLAttributes } from "react";

import fallbackStill from "~/assets/birdLogo.avif";

export type DescriptionPanelAlternate = "main" | "alternate";

export type DescriptionPanelImage = {
  src: string;
  alt?: string;
};

export type DescriptionPanelProps = {
  /** Up to four thumbnail images for the 2×2 grid. */
  images?: DescriptionPanelImage[];
  /** Caption / product copy shown under the grid. */
  text?: string;
  className?: string;
  alternate?: DescriptionPanelAlternate;
} & Omit<HTMLAttributes<HTMLDivElement>, "className" | "children">;

const alternateClasses: Record<DescriptionPanelAlternate, string> = {
  main: ["bg-stone-900 text-stone-50"].join(" "),
  alternate: ["bg-transparent text-stone-900"].join(" "),
};

const defaultImages: DescriptionPanelImage[] = [
  { src: fallbackStill, alt: "Product view 1" },
  { src: fallbackStill, alt: "Product view 2" },
  { src: fallbackStill, alt: "Product view 3" },
  { src: fallbackStill, alt: "Product view 4" },
];

export function DescriptionPanel({
  images = defaultImages,
  text = "Product description goes here.",
  className = "",
  alternate = "alternate",
  ...rest
}: DescriptionPanelProps) {
  const thumbs = images.slice(0, 4);

  return (
    <div
      className={[
        "flex h-full min-w-0 flex-col gap-3 p-4",
        alternateClasses[alternate],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <div className="grid grid-cols-2 gap-2">
        {thumbs.map((image, index) => (
          <img
            key={`${image.src}-${index}`}
            src={image.src}
            alt={image.alt ?? `Product thumbnail ${index + 1}`}
            className="aspect-square w-full object-cover"
          />
        ))}
      </div>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}
