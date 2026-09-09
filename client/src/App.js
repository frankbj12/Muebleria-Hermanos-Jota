import React from 'react';

// Placeholders de componentes requeridos para Sprint 03-04
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ProductList from './components/ProductList/ProductList';
import ProductDetail from './components/ProductDetail/ProductDetail';
import ContactForm from './components/ContactForm/ContactForm';

function App() {
  // TODO (Sprint 03-04): Manejo del estado del carrito, estados de productos (loading, error, data) y fetch a GET /api/productos

  return (
    <div className="App">
      <Navbar />
      <main>
        <h1>Mueblería Hermanos Jota</h1>
        <ProductList />
        <ProductDetail />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}

export default App;
