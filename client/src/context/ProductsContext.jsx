import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import productosApi from '../services/productosApi';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshProducts = useCallback(async () => {
    setLoading(true);

    try {
      const data = await productosApi.getAll();
      if (!Array.isArray(data)) {
        throw new Error('La API no devolvió una lista de productos.');
      }
      setProducts(data);
      setError(null);
      return data;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts().catch((requestError) => {
      console.error('No se pudo cargar el catálogo:', requestError);
    });
  }, [refreshProducts]);

  const createProduct = useCallback(
    async (product) => {
      const createdProduct = await productosApi.create(product);
      await refreshProducts();
      return createdProduct;
    },
    [refreshProducts]
  );

  const updateProduct = useCallback(
    async (id, product) => {
      const updatedProduct = await productosApi.update(id, product);
      await refreshProducts();
      return updatedProduct;
    },
    [refreshProducts]
  );

  const removeProduct = useCallback(
    async (id) => {
      await productosApi.remove(id);
      await refreshProducts();
    },
    [refreshProducts]
  );

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts,
        createProduct,
        updateProduct,
        removeProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts debe usarse dentro de ProductsProvider');
  }
  return context;
}
