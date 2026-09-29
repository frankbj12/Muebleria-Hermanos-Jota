import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

// Componentes requeridos para Sprint 03-04
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ProductList from './components/ProductList/ProductList';
import ProductDetail from './components/ProductDetail/ProductDetail';
import ContactForm from './components/ContactForm/ContactForm';
import Home from './components/Home/Home';
import { CartProvider, useCart } from './context/CartContext';

function App() {
  // Estados para productos obtenidos desde la API (GET /api/productos)
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch de productos al montar el componente (conectar con backend de Express)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/productos');
        if (!response.ok) {
          throw new Error(
            `Error en la petición: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        // En caso de que el backend aún no esté corriendo en este sprint, capturamos el error
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <CartProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="App">
          <Navbar />

          <main>
            <Routes>
              <Route
                path="/"
                element={<Home products={products} loading={loading} error={error} />}
              />
              <Route
                path="/productos"
                element={
                  <ProductList
                    products={products}
                    loading={loading}
                    error={error}
                  />
                }
              />
              <Route
                path="/producto"
                element={
                  <ProductRoute
                    products={products}
                    loading={loading}
                    error={error}
                  />
                }
              />
              <Route path="/contacto" element={<ContactForm />} />
              <Route path="/carrito" element={<CartPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

function ProductRoute({ products, loading, error }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('id');
  const product = products.find((item) => String(item.id) === productId);

  if (loading) {
    return (
      <section className="product-detail">
        <div className="container">
          <p className="products-loading" role="status">
            Cargando producto...
          </p>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="product-detail">
        <div className="container">
          <div className="catalog-empty">
            <h1>
              {error ? 'No se pudo cargar el producto' : 'Producto no encontrado'}
            </h1>
            <p>{error || 'El producto solicitado no existe.'}</p>
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

function CartPage() {
  const { cart, removeFromCart } = useCart();
  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const formatPrice = (price) => `$ ${price.toLocaleString('es-AR')}`;

  return (
    <section className="cart-section">
      <div className="container">
        <h1 className="section-title">Carrito</h1>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <h2>Tu carrito está vacío</h2>
            <p>Explorá la colección y encontrá tu próxima pieza favorita.</p>
            <Link to="/productos" className="btn btn-primary">
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.map((item) => (
                <article className="cart-item" key={item.id}>
                  <Link
                    to={`/producto?id=${item.id}`}
                    className="cart-item-image"
                    aria-label={`Ver ${item.name}`}
                  >
                    <img src={`/${item.image}`} alt={item.name} />
                  </Link>
                  <div className="cart-item-info">
                    <h2>{item.name}</h2>
                    <p className="cart-item-price">{formatPrice(item.price)}</p>
                  </div>
                  <div className="cart-item-actions">
                    <span>
                      {item.quantity || 1}{' '}
                      {(item.quantity || 1) === 1 ? 'unidad' : 'unidades'}
                    </span>
                    <button
                      type="button"
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Quitar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="cart-summary">
              <h2>Resumen</h2>
              <div className="cart-summary-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Link to="/productos" className="btn btn-secondary">
                Seguir comprando
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

function NotFoundPage() {
  return (
    <section className="contact-section">
      <div className="container">
        <div className="catalog-empty">
          <h1>Página no encontrada</h1>
          <p>La dirección que buscás no está disponible.</p>
          <Link to="/" className="btn btn-primary">
            Ir al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}

export default App;
