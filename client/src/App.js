import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
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
import { CartProvider } from './context/CartContext';
import { useToast } from './context/ToastContext';
import CartPage from './components/CartPage/CartPage.jsx';

const API_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.endsWith('/api/productos')
    ? process.env.REACT_APP_API_URL
    : `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/api/productos`
  : 'http://localhost:5000/api/productos';

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
        const response = await fetch(API_URL);
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
        <ScrollToTop />
        <div className="App">
          <Navbar />

          <main>
            <Routes>
              <Route
                path="/"
                element={
                  <Home products={products} loading={loading} error={error} />
                }
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

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  return null;
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
              {error
                ? 'No se pudo cargar el producto'
                : 'Producto no encontrado'}
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

// CartPage component moved to ./components/CartPage/CartPage.jsx
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
