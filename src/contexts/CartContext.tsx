import React, { createContext, useContext, useState, useCallback } from "react";
import type { Product } from "@/data/mockData";

export interface CartItem extends Product {
  quantidade: number;
  marketId: string;
  marketNome: string;
  marketWhatsapp: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, marketId: string, marketNome: string, marketWhatsapp: string) => void;
  removeItem: (productId: string, marketId: string) => void;
  updateQuantity: (productId: string, marketId: string, quantidade: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback(
    (product: Product, marketId: string, marketNome: string, marketWhatsapp: string) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id && i.marketId === marketId);
        if (existing) {
          return prev.map((i) =>
            i.id === product.id && i.marketId === marketId
              ? { ...i, quantidade: i.quantidade + 1 }
              : i
          );
        }
        return [...prev, { ...product, quantidade: 1, marketId, marketNome, marketWhatsapp }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, marketId: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === productId && i.marketId === marketId)));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, marketId: string, quantidade: number) => {
      if (quantidade <= 0) {
        removeItem(productId, marketId);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.id === productId && i.marketId === marketId ? { ...i, quantidade } : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.preco * i.quantidade, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantidade, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, isOpen, setIsOpen }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
