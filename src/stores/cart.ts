import { create } from "zustand";
import { persist } from "zustand/middleware";

// UUID generator seguro (funciona em qualquer ambiente)
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

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
  _hydrated: boolean;
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
      _hydrated: false,

      addItem: (item) => {
        const items = get().items;
        // Verifica se já existe item idêntico (mesmo produto+variante+upload+tamanho+acabamento)
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
                cartItemId: generateId(),
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
    {
      name: "stickershop-cart",
      // resolve problema de hidratação com Next.js SSR
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrated = true;
        }
      },
      // garante que dados inválidos não quebrem a store
      merge: (persisted: any, current) => {
        if (!persisted || !Array.isArray(persisted.items)) {
          return current;
        }
        return {
          ...current,
          ...persisted,
          items: (persisted.items || []).filter(
            (i: any) => i && i.cartItemId && i.name
          ),
          _hydrated: true,
        };
      },
    }
  )
);
