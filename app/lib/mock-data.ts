/**
 * Placeholder catalog / cart data used when Flask is not running yet.
 * Swap these out once listProducts() / getCart() return real SQL rows.
 */

import productStill from "~/assets/birdLogo.avif";
import productPreview from "~/assets/product-preview.mp4";
import type { Cart, Product } from "./types";

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Linen overshirt",
    slug: "linen-overshirt",
    description: "Light layer for warm weather.",
    price: 88,
    stock: 12,
    image_url: productStill,
    video_url: productPreview,
  },
  {
    id: 2,
    name: "Canvas tote",
    slug: "canvas-tote",
    description: "Everyday bag with a wide strap.",
    price: 34,
    stock: 24,
    image_url: productStill,
    video_url: productPreview,
  },
  {
    id: 3,
    name: "Wool beanie",
    slug: "wool-beanie",
    description: "Ribbed knit, one size.",
    price: 22,
    stock: 40,
    image_url: productStill,
    video_url: productPreview,
  },
  {
    id: 4,
    name: "House soap",
    slug: "house-soap",
    description: "Cedar and bergamot bar.",
    price: 12,
    stock: 60,
    image_url: productStill,
    video_url: productPreview,
  },
];

export const mockCart: Cart = {
  id: 1,
  items: [
    {
      id: 1,
      product_id: 1,
      product: mockProducts[0],
      quantity: 1,
      line_total: 88,
    },
    {
      id: 2,
      product_id: 2,
      product: mockProducts[1],
      quantity: 2,
      line_total: 68,
    },
  ],
  subtotal: 156,
  item_count: 3,
};

export const emptyCart: Cart = {
  id: 0,
  items: [],
  subtotal: 0,
  item_count: 0,
};
