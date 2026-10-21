import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

export const CartContext = createContext(null);
const CART_STORAGE_KEY = 'hermanos-jota-cart';

function readCartFromStorage() {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) return [];

    const cart = JSON.parse(storedCart);
    if (!Array.isArray(cart)) {
      throw new Error('El contenido guardado del carrito no es una lista.');
    }

    return cart;
  } catch (error) {
    console.error('No se pudo recuperar el carrito guardado:', error);
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readCartFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('No se pudo guardar el carrito:', error);
    }
  }, [cart]);

  const addToCart = (product) => {
    if (!product) return false;
    if (typeof product.stock === 'number' && product.stock <= 0) {
      return false;
    }

    const productId = product.id ?? product._id;
    if (!productId) return false;

    const existingItem = cart.find(
      (item) => (item.id ?? item._id) === productId
    );
    if (
      existingItem &&
      typeof product.stock === 'number' &&
      (existingItem.quantity || 1) >= product.stock
    ) {
      return false;
    }

    setCart((items) => {
      const existing = items.find(
        (item) => (item.id ?? item._id) === productId
      );

      if (existing) {
        if (
          typeof product.stock === 'number' &&
          (existing.quantity || 1) >= product.stock
        ) {
          return items;
        }

        return items.map((item) =>
          (item.id ?? item._id) === productId
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }

      return [...items, { ...product, id: productId, quantity: 1 }];
    });

    return true;
  };

  const removeFromCart = (productId) => {
    setCart((items) =>
      items.filter((item) => (item.id ?? item._id) !== productId)
    );
  };

  const updateQuantity = (productId, delta) => {
    setCart((items) => {
      const updated = items.map((item) => {
        if ((item.id ?? item._id) !== productId) return item;

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
