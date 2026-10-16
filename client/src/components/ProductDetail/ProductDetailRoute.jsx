import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import productosApi from '../../services/productosApi';
import ProductDetail from './ProductDetail';

function ProductDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setProduct(null);
      setError(null);

      try {
        const result = await productosApi.getById(id, {
          signal: controller.signal,
        });
        setProduct(result);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProduct();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <section className="product-detail" aria-label="Cargando detalle">
        <div className="container">
          <p className="products-loading" role="status">
            Cargando producto...
          </p>
        </div>
      </section>
    );
  }

  if (error || !product) {
    const notFound = error?.status === 404;

    return (
      <section className="product-detail" aria-label="Detalle de producto">
        <div className="container">
          <div className="catalog-empty">
            <h1>
              {notFound
                ? 'Producto no encontrado'
                : 'No se pudo cargar el producto'}
            </h1>
            <p>
              {error?.message ||
                'El producto solicitado no existe en nuestro catálogo.'}
            </p>
            <Link to="/productos" className="btn btn-secondary">
              Volver al catálogo
            </Link>
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
