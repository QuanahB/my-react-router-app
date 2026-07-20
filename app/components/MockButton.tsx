/**
 * =============================================================================
 * MockButton — a reusable, styled <button> for the ecommerce storefront
 * =============================================================================
 *
 * WHY A COMPONENT (not just a raw <button> in every page)?
 *   - One place to change look/behavior → every "Add to cart" stays consistent
 *   - Props let parents pass labels, click handlers, and disabled state
 *   - Variants (primary / secondary / ghost) share the same base styles
 *
 * HOW TO RECREATE SOMETHING LIKE THIS FOR MockComponent:
 *   1. Define a Props type (what the parent is allowed to pass in)
 *   2. Optionally map "variants" or "sizes" to Tailwind class strings
 *   3. Write a function component that returns JSX
 *   4. Destructure props with defaults, then put Tailwind classes on the root
 *   5. Export the component so routes can: import { MockButton } from "..."
 *
 * Tailwind note: classes like `bg-stone-900` come from Tailwind CSS (see
 * app/app.css). They compile to real CSS — you do not write a separate .css
 * file for each small style change.
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------
// `import type` means these are TypeScript-only — erased at build time.
// ButtonHTMLAttributes = all normal <button> attributes (onClick, disabled…)
// ReactNode = anything React can render as children (text, icons, elements)
import type { ButtonHTMLAttributes, ReactNode } from "react";

// ---------------------------------------------------------------------------
// Variant union type
// ---------------------------------------------------------------------------
// A "union" of string literals: only these three values are allowed.
// If you typo "primry", TypeScript errors — helpful when recreating components.
export type MockButtonVariant = "primary" | "secondary" | "ghost";

// ---------------------------------------------------------------------------
// Props type — the public API of this component
// ---------------------------------------------------------------------------
// Think of props as the "inputs" a parent passes:
//   <MockButton variant="secondary" onClick={...}>Label</MockButton>
//
// Pattern used here:
//   { our custom fields } & Omit<NativeButtonProps, "className">
//
// - We define `className` ourselves so we can merge it with internal styles
// - Omit<..., "className"> means: accept every native button prop EXCEPT
//   className (because we already declared it above — avoids a type clash)
// - `&` intersects (combines) the two object types into one
export type MockButtonProps = {
  /** Visible content inside the button (required). */
  children: ReactNode;

  /**
   * Visual style preset. The `?` means optional — if omitted, we default
   * to "primary" in the function parameters below.
   */
  variant?: MockButtonVariant;

  /**
   * Extra Tailwind classes from the PARENT for layout only
   * (e.g. "w-full mt-4"). Keeps spacing decisions outside this file.
   */
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

// ---------------------------------------------------------------------------
// Variant → Tailwind class map
// ---------------------------------------------------------------------------
// Record<Key, Value> means: an object whose keys are every MockButtonVariant
// and whose values are strings (our class lists).
//
// Why a map instead of if/else in JSX?
//   - Easier to scan and extend (add "danger" later in one place)
//   - Keeps the JSX return block shorter and clearer
//
// Each entry is written as an array of strings + .join(" ") only so comments
// can sit next to related classes; one long string would work the same.
const variantClasses: Record<MockButtonVariant, string> = {
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

// ---------------------------------------------------------------------------
// The component function
// ---------------------------------------------------------------------------
// `export function` makes this importable from other files.
// The parameter list uses destructuring:
//   - Pull named props out of the props object
//   - `= "primary"` etc. are defaults when the parent omits them
//   - `...rest` gathers leftover native props (onClick, aria-label, …)
//     so we can spread them onto the real <button> below
/**
 * Renders a semantic HTML <button> with shared storefront styles.
 *
 * Default `type="button"` matters inside forms: without it, HTML defaults
 * buttons to type="submit", which would submit the form by accident.
 */
export function MockButton({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
  ...rest
}: MockButtonProps) {
  return (
    // Real DOM element — important for accessibility and forms.
    // Do not replace this with a <div onClick> unless you have a rare reason.
    <button
      type={type}
      disabled={disabled}
      // ---------------------------------------------------------------
      // Building the final className string
      // ---------------------------------------------------------------
      // We collect many class strings in an array, then:
      //   .filter(Boolean) — drops empty strings if any slip in
      //   .join(" ")       — turns ["a", "b"] into "a b" for React
      //
      // Order idea: base layout → motion → focus → disabled chrome →
      //             variant look → parent overrides (className last so
      //             the parent can tweak when needed)
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
