import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => set((state) => {
                const existing = state.items.find(i => i.productId === item.productId && i.size === item.size);
                if (existing) {
                    return {
                        items: state.items.map(i => 
                            (i.productId === item.productId && i.size === item.size)
                                ? { ...i, qty: i.qty + item.qty } : i
                        )
                    };
                }
                return { items: [...state.items, item] };
            }),
            removeItem: (productId, size) => set((state) => ({
                items: state.items.filter(i => !(i.productId === productId && i.size === size))
            })),
            updateQty: (productId, size, qty) => set((state) => ({
                items: state.items.map(i => 
                    (i.productId === productId && i.size === size)
                        ? { ...i, qty } : i
                )
            })),
            clearCart: () => set({ items: [] }),
            getTotal: () => get().items.reduce((total, item) => total + (item.price * item.qty), 0)
        }),
        {
            name: 'vintage-cart-storage'
        }
    )
);
