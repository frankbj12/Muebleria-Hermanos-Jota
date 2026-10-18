import React, { createContext, useContext, useState } from 'react';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    if (!product) return false;
    if (typeof product.stock === 'number' && product.stock <= 0) {
      return false;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    if (
      existingItem &&
      typeof product.stock === 'number' &&
      (existingItem.quantity || 1) >= product.stock
    ) {
      return false;
    }

    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);

      if (existing) {
        if (
          typeof product.stock === 'number' &&
          (existing.quantity || 1) >= product.stock
        ) {
          return items;
        }

        return items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }

      return [...items, { ...product, quantity: 1 }];
    });

    return true;
  };

  const removeFromCart = (productId) => {
    setCart((items) => items.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((items) => {
      const updated = items.map((item) => {
        if (item.id !== productId) return item;

        const currentQty = item.quantity || 1;
        const newQty = currentQty + delta;

        if (
          delta > 0 &&
          typeof item.stock === 'number' &&
          newQty > item.stock
        ) {
          return item;
        }

        return { ...item, quantity: newQty };
      });
      return updated.filter((item) => (item.quantity || 1) > 0);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }

  return context;
}
