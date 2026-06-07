import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItemType = {
  cartItemId: string;
  productId: string | null;
  variantId?: string | null;
  uploadId?: string | null;
  itemType: "produto_pronto" | "personalizado";
  name: string;
  imageUrl: string;
  size: string;
  finish: string;
  unitPrice: number;
  quantity: number;
  categoryId?: string | null;
};

type CartState = {
  items: CartItemType[];
  addItem: (item: Omit<CartItemType, "cartItemId" | "quantity"> & { quantity?: number }) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        // Verifica se já existe item idêntico (mesmo produto+variante+upload)
        const existing = items.find(
          (i) =>
            i.productId === item.productId &&
            i.variantId === item.variantId &&
            i.uploadId === item.uploadId &&
            i.size === item.size &&
            i.finish === item.finish
        );

        if (existing) {
          set({
            items: items.map((i) =>
              i.cartItemId === existing.cartItemId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                ...item,
                cartItemId: crypto.randomUUID(),
                quantity: item.quantity || 1,
              },
            ],
          });
        }
      },

      removeItem: (cartItemId) => {
        set({ items: get().items.filter((i) => i.cartItemId !== cartItemId) });
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    }),
    { name: "stickershop-cart" }
  )
);
