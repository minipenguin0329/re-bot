import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import type { Product } from '@/src/data/products';

type CartItem = { product: Product; qty: number };
type CartContextValue = { items: CartItem[]; addItem: (product: Product) => void; removeItem: (productId: string) => void; updateQty: (productId: string, qty: number) => void; clearCart: () => void; totalCount: number; totalPrice: number };

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product) => setItems((current) => {
    const existing = current.find((item) => item.product.id === product.id);
    if (existing) return current.map((item) => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
    return [...current, { product, qty: 1 }];
  });
  const removeItem = (productId: string) => setItems((current) => current.filter((item) => item.product.id !== productId));
  const updateQty = (productId: string, qty: number) => setItems((current) => qty <= 0 ? current.filter((item) => item.product.id !== productId) : current.map((item) => item.product.id === productId ? { ...item, qty } : item));
  const clearCart = () => setItems([]);
  const totalCount = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.product.price * item.qty, 0), [items]);

  return <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalCount, totalPrice }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
