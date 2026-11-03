import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

// Componentes requeridos para Sprint 03-04
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ProductList from './components/ProductList/ProductList';
import ProductDetailRoute from './components/ProductDetail/ProductDetailRoute';
import ContactForm from './components/ContactForm/ContactForm';
import Home from './components/Home/Home';
import { CartProvider } from './context/CartContext';
import CartPage from './components/Cart/CartPage';
import { ProductsProvider, useProducts } from './context/ProductsContext';
import AdminPanel from './components/Admin/AdminPanel';
import ProductForm from './components/Admin/ProductForm';
import Chatbot from './components/Chatbot/Chatbot';

function App() {
  return (
    <CartProvider>
      <ProductsProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppLayout />
        </BrowserRouter>
      </ProductsProvider>
    </CartProvider>
  );
}

function AppLayout() {
  const { products, loading, error } = useProducts();

  return (
    <>
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
            <Route path="/productos/:id" element={<ProductDetailRoute />} />
            <Route path="/contacto" element={<ContactForm />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/crear-producto" element={<ProductForm />} />
            <Route
              path="/admin/editar-producto/:id"
              element={<ProductForm />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
        <Chatbot />
      </div>
    </>
  );
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  return null;
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
