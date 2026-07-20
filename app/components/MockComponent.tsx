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

export type MockComponentProps = {
  /** Optional label so you can see the stub on the page while designing. */
  title?: string;
  /** Optional extra class names from the parent. */
  className?: string;
  // Add real props here, e.g.:
  // product: Product;
  // onAddToCart?: (productId: number) => void;
};

/**
 * Placeholder presentational component.
 * Replace the markup and styles when you build the real UI.
 */
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
