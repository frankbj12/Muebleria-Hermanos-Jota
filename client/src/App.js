import React, { useState, useEffect } from 'react';

// Componentes requeridos para Sprint 03-04
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ProductList from './components/ProductList/ProductList';
import ProductDetail from './components/ProductDetail/ProductDetail';
import ContactForm from './components/ContactForm/ContactForm';

function App() {
  // Estado del carrito de compras (array de productos agregados con quantity)
  const [cart, setCart] = useState([]);

  // Estado del producto actualmente seleccionado para ver en detalle
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  /**
   * Agrega un producto al carrito o incrementa su cantidad si ya existe.
   * Utiliza la forma funcional de setState para garantizar inmutabilidad.
   */
  const handleAddToCart = (product) => {
    if (!product) return;

    setCart((prevCart) => {
      const itemIndex = prevCart.findIndex((item) => item.id === product.id);

      if (itemIndex >= 0) {
        return prevCart.map((item, index) =>
          index === itemIndex
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }

      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  /**
   * Quita un producto del carrito por su id.
   */
  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  /**
   * Selecciona un producto para visualizar en ProductDetail.
   */
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  /**
   * Limpia la selección de producto (vuelve al estado placeholder en ProductDetail).
   */
  const handleClearSelection = () => {
    setSelectedProduct(null);
  };

  // Estado derivado: Contador total de artículos en el carrito
  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return (
    <div className="App">
      {/* Navbar recibe el contador del carrito vía props */}
      <Navbar cartCount={cartCount} />

      <main className="main-content">
        <header className="page-header">
          <h1>Mueblería Hermanos Jota</h1>
          <p className="page-tagline">Redescubrir el arte de vivir</p>
        </header>

        {/* Listado de productos del catálogo */}
        <ProductList
          products={products}
          loading={loading}
          error={error}
          onSelectProduct={handleSelectProduct}
          onAddToCart={handleAddToCart}
        />

        {/* Detalle del producto con renderizado condicional */}
        <ProductDetail
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          onClearSelection={handleClearSelection}
        />

        {/* Formulario de contacto controlado con useState */}
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}

export default App;
