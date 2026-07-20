/**
 * Mock UI component template.
 *
 * Copy or rename this file when you add a real storefront piece
 * (e.g. ProductCard.tsx, SiteHeader.tsx, CartSummary.tsx).
 *
 * Wiring tips:
 *   - Style with Tailwind classes on the elements below.
 *   - Pass data in via props (prefer shapes from app/lib/types.ts).
 *   - Add click / submit handlers as props or inline later.
 *   - Prefer loading Flask data in a route loader, then pass it down here.
 */

import type {TextareaHTMLAttributes,ReactNode } from "react";
export type MockComponentAlternate = "main" | "alternate" | "test";

export type MockComponentProps = {
  /** Optional label so you can see the stub on the page while designing. */
  title?: string;

  className?: string;
  alternate?: MockComponentAlternate;
  children: ReactNode; //MYCOMMENT: Need to see if this is necassary for this component
  // Add real props here, e.g.:
  // product: Product;
  // onAddToCart?: (productId: number) => void;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>,"className">;


//Tailwind Class Map 
const alternateClasses: Record<MockComponentAlternate, string> = {
  main:["bg-stone-900 text-stone-50"].join(" "),
  alternate:["bg-transparent text-stone-900"].join(" "),
  test:["bg-transparent text-stone-700"].join(" "),
};



export function MockComponent({
  title = "Mock component",
  className = "",
}: MockComponentProps) {
  return (
    <div className={className}>
      {/* TODO: replace with your layout / Tailwind styles */}
      <p>{title}</p>
    </div>
  );
}
