import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ProductDetail from './ProductDetail';

/**
 * Componente ProductDetailRoute
 * Gestiona la ruta de detalle de un producto (/producto?id=...), permitiendo
 * consumir directamente el endpoint GET /api/productos/:id del backend si el producto
 * no se encuentra en el estado global o si se accede directamente por URL.
 */
function ProductDetailRoute({
  products = [],
  loading = false,
  error = null,
  apiBaseUrl,
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('id');

  const [singleProduct, setSingleProduct] = useState(null);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState(null);

  // Buscar en la lista de productos ya cargados
  const cachedProduct = products.find((item) => String(item.id) === productId);

  // Si no está en cache pero hay id y no estamos en carga inicial global, consultar endpoint individual
  useEffect(() => {
    if (cachedProduct) {
      setSingleProduct(cachedProduct);
      setSingleError(null);
      return;
    }

    if (!productId) {
      return;
    }

    // Si la lista global sigue cargando, esperamos a que termine
    if (loading) return;

    let isMounted = true;
    const fetchSingleProduct = async () => {
      setSingleLoading(true);
      setSingleError(null);

      const endpoint = apiBaseUrl
        ? `${apiBaseUrl.replace(/\/$/, '')}/${productId}`
        : `http://localhost:5000/api/productos/${productId}`;

      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('El producto solicitado no existe.');
          }
          throw new Error(`Error del servidor (${response.status})`);
        }
        const data = await response.json();
        if (isMounted) {
          setSingleProduct(data);
        }
      } catch (err) {
        if (isMounted) {
          setSingleError(err.message || 'No se pudo cargar el producto');
        }
      } finally {
        if (isMounted) {
          setSingleLoading(false);
        }
      }
    };

    fetchSingleProduct();

    return () => {
      isMounted = false;
    };
  }, [productId, cachedProduct, loading, apiBaseUrl]);

  const product = cachedProduct || singleProduct;
  const isLoading = loading || singleLoading;
  const currentError = error || singleError;

  if (isLoading) {
    return (
      <section
        className="product-detail"
        aria-label="Cargando detalle de producto"
      >
        <div className="container">
          <div className="loading-container" role="status" aria-live="polite">
            <div className="loading-spinner" aria-hidden="true"></div>
            <p className="products-loading">Cargando producto...</p>
          </div>
        </div>
      </section>
    );
  }

  if (currentError || !product) {
    return (
      <section className="product-detail" aria-label="Detalle de producto">
        <div className="container">
          <div className="catalog-empty">
            <h1>
              {currentError
                ? 'No se pudo cargar el producto'
                : 'Producto no encontrado'}
            </h1>
            <p>
              {currentError ||
                'El producto solicitado no existe en nuestro catálogo.'}
            </p>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                marginTop: '1.5rem',
              }}
            >
              <Link to="/productos" className="btn btn-secondary">
                Volver al catálogo
              </Link>
              <Link to="/" className="btn btn-primary">
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <ProductDetail
      product={product}
      onClearSelection={() => navigate('/productos')}
    />
  );
}

export default ProductDetailRoute;
