import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
    id: string;
    title: string;
    author: string;
    price: number;
    image: string;
    quantity: number;
    selected?: boolean;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "quantity" | "selected">) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    toggleSelection: (id: string) => void;
    toggleAll: (selected: boolean) => void;
    removeSelected: () => void;
    clearCart: () => void;
    total: () => number;
    promoCode: string | null;
    discount: number;
    applyPromoCode: (code: string, discount: number) => void;
    removePromoCode: () => void;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            promoCode: null,
            discount: 0,
            addItem: (item) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((i) => i.id === item.id);

                if (existingItem) {
                    set({
                        items: currentItems.map((i) =>
                            i.id === item.id
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        ),
                    });
                } else {
                    set({ items: [...currentItems, { ...item, quantity: 1, selected: true }] });
                }
            },
            removeItem: (id) => {
                set({ items: get().items.filter((i) => i.id !== id) });
            },
            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    set({ items: get().items.filter((i) => i.id !== id) });
                } else {
                    set({
                        items: get().items.map((i) =>
                            i.id === id ? { ...i, quantity } : i
                        ),
                    });
                }
            },
            clearCart: () => set({ items: [], promoCode: null, discount: 0 }),
            total: () => {
                const itemsTotal = get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
                return Math.max(0, itemsTotal - get().discount);
            },
            toggleSelection: (id) => {
                set({
                    items: get().items.map((i) =>
                        i.id === id ? { ...i, selected: !i.selected } : i
                    ),
                });
            },
            toggleAll: (selected) => {
                set({
                    items: get().items.map((i) => ({ ...i, selected })),
                });
            },
            removeSelected: () => {
                set({
                    items: get().items.filter((i) => !i.selected),
                });
            },
            applyPromoCode: (code, discount) => set({ promoCode: code, discount }),
            removePromoCode: () => set({ promoCode: null, discount: 0 }),
        }),
        {
            name: "cart-storage",
            version: 1, // Increment this when you need to force migration
            migrate: (persistedState: any, version: number) => {
                // Ensure all items have an image property (migration for old cart items)
                if (persistedState && persistedState.items) {
                    persistedState.items = persistedState.items.map((item: any) => ({
                        ...item,
                        image: item.image || "", // Default to empty string if image is missing
                        quantity: item.quantity || 1, // Ensure quantity exists
                        selected: item.selected !== undefined ? item.selected : true, // Default selected to true
                    }));
                }
                return persistedState;
            },
        }
    )
);
