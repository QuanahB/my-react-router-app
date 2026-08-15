import type { ButtonHTMLAttributes, ReactNode } from "react";
export type SelectorVariant = "primary" | "secondary" | "ghost";


export type SelectorProps = {
  /** Visible content inside the button (required). */
  children: ReactNode;

  variant?: SelectorVariant;

  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

const variantClasses: Record<SelectorVariant, string> = {
  // PRIMARY — strongest CTA (checkout, add to cart)
  primary: [
    "bg-stone-900 text-stone-50", // dark fill, light text
    "hover:bg-stone-800", // slightly lighter on mouse-over
    "active:bg-stone-950", // darker while the mouse is pressed
    "disabled:bg-stone-400 disabled:text-stone-100", // muted when disabled
  ].join(" "),

  // SECONDARY — outline; same size/weight as primary, less visual weight
  secondary: [
    "bg-transparent text-stone-900", // no fill by default
    "border border-stone-900", // ink outline
    "hover:bg-stone-900 hover:text-stone-50", // fill in on hover
    "active:bg-stone-950 active:text-stone-50",
    // When disabled, kill the hover fill so it doesn't look clickable
    "disabled:border-stone-300 disabled:text-stone-400 disabled:hover:bg-transparent",
  ].join(" "),

  // GHOST — text-only; for low-emphasis actions (e.g. "Continue shopping")
  ghost: [
    "bg-transparent text-stone-700",
    "hover:text-stone-950 hover:underline underline-offset-4",
    "disabled:text-stone-400 disabled:no-underline",
  ].join(" "),
};

export function SelectorComponent({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
  ...rest
}: SelectorProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        // --- Layout / box model (shared by every variant) ---
        "inline-flex items-center justify-center gap-2", // flex row; centers label + optional icon; gap between them
        "px-5 py-2.5", // horizontal / vertical padding (click target size)
        "rounded-md", // modest corner radius (not a full pill)

        // --- Typography ---
        "text-sm font-medium tracking-wide", // small, medium weight, slight letter-spacing

        // --- Motion ---
        // Only animate color so hover feels smooth without bouncing layout
        "transition-colors duration-150 ease-out",

        // --- Keyboard focus (accessibility) ---
        // focus-visible = show ring for keyboard users, not every mouse click
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600",

        // --- Disabled + cursor (shared chrome; colors still come from variant) ---
        "disabled:cursor-not-allowed disabled:opacity-70",
        "cursor-pointer",

        // --- Variant-specific colors / borders / hover rules ---
        variantClasses[variant],

        // --- Parent-provided classes last ---
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      // Spread remaining native button props (onClick, name, aria-*, …)
      {...rest}
    >
      {/* children = whatever the parent nested between the tags */}
      {children}
    </button>
  );
}