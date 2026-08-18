/**
 * Product still image that swaps to a stored video on hover.
 *
 * Intended for HomepageContainer (usually the 2/3 left column):
 *   <HomepageContainer left={<ProductImage />} right={<p>Details</p>} />
 *
 * Props:
 *   src      — still image URL (Vite import or Flask image_url)
 *   videoSrc — local/remote video URL; shown + played while hovered
 *   alt      — accessible name for the image
 *
 * Hover uses React state (not CSS-only) so we can call video.play() /
 * pause(). Browsers block unmuted autoplay, so the clip is muted.
 */

import { useEffect, useRef, useState } from "react";
import type { ImgHTMLAttributes } from "react";

import productStill from "~/assets/birdLogo.avif";
import productPreview from "~/assets/product-preview.mp4";

export type ProductImageAlternate = "main" | "alternate";
export type ProductImageAspect = "video" | "square";

export type ProductImageProps = {
  /** Still image shown until hover. */
  src?: string;
  /** Stored video shown while the pointer is over the component. */
  videoSrc?: string;
  alt?: string;
  className?: string;
  alternate?: ProductImageAlternate;
  /** Frame shape — `video` (16:9) for the homepage, `square` for the shop grid. */
  aspect?: ProductImageAspect;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "className" | "src" | "alt">;

const alternateClasses: Record<ProductImageAlternate, string> = {
  main: ["bg-stone-900"].join(" "),
  alternate: ["bg-transparent"].join(" "),
};

const aspectClasses: Record<ProductImageAspect, string> = {
  video: "aspect-video",
  square: "aspect-square",
};

export function ProductImage({
  src = productStill,
  videoSrc = productPreview,
  alt = "Product preview",
  className = "",
  alternate = "main",
  aspect = "video",
  ...rest
}: ProductImageProps) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play on hover, rewind when the pointer leaves so the next hover starts fresh.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    if (hovered) {
      void video.play();
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [hovered, videoSrc]);

  return (
    <div
      className={[
        "relative w-full overflow-hidden",
        aspectClasses[aspect],
        alternateClasses[alternate],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={src}
        alt={alt}
        className={[
          "absolute inset-0 h-full w-full object-cover",
          "transition-opacity duration-200",
          hovered && videoSrc ? "opacity-0" : "opacity-100",
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />

      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden={!hovered}
          className={[
            "absolute inset-0 h-full w-full object-cover",
            "transition-opacity duration-200",
            hovered ? "opacity-100" : "opacity-0",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ) : null}
    </div>
  );
}
