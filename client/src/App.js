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
import { AuthProvider } from './context/AuthContext';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton';
import LegalTerms from './components/Legal/LegalTerms';
import LegalPrivacy from './components/Legal/LegalPrivacy';
import LegalReturns from './components/Legal/LegalReturns';
import { RepentanceModalProvider } from './context/RepentanceModalContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductsProvider>
          <RepentanceModalProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AppLayout />
            </BrowserRouter>
          </RepentanceModalProvider>
        </ProductsProvider>
      </CartProvider>
    </AuthProvider>
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
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/crear-producto"
              element={
                <ProtectedRoute adminOnly>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/editar-producto/:id"
              element={
                <ProtectedRoute adminOnly>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route path="/terminos-y-condiciones" element={<LegalTerms />} />
            <Route path="/politica-de-privacidad" element={<LegalPrivacy />} />
            <Route path="/cambios-y-devoluciones" element={<LegalReturns />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
        <WhatsAppButton />
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
