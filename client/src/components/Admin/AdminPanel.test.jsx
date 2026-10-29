import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminPanel from './AdminPanel';

const mockProducts = [
  {
    id: 1,
    name: 'Sillón Bauhaus',
    category: 'living',
    description: 'Sillón en cuero y madera',
    price: 320000,
    stock: 5,
    featured: true,
    image: 'assets/products/sillon.png',
  },
  {
    id: 2,
    name: 'Mesa Nogal',
    category: 'comedor',
    description: 'Mesa amplia de nogal macizo',
    price: 680000,
    stock: 2,
    featured: false,
    image: 'assets/products/mesa.png',
  },
  {
    id: 3,
    name: 'Silla Viena',
    category: 'comedor',
    description: 'Silla curvada artesanal',
    price: 110000,
    stock: 0,
    featured: false,
    image: 'assets/products/silla.png',
  },
];

const mockRemoveProduct = jest.fn();
const mockAddToast = jest.fn();

jest.mock('../../context/ProductsContext', () => ({
  useProducts: () => ({
    products: mockProducts,
    loading: false,
    error: null,
    removeProduct: mockRemoveProduct,
  }),
}));

jest.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

describe('AdminPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza el título, las métricas y la tabla de productos', () => {
    render(
      <MemoryRouter>
        <AdminPanel />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Inventario y Catálogo/i })).toBeInTheDocument();
    expect(screen.getByText('Total Productos')).toBeInTheDocument();
    expect(screen.getByTestId('metric-total-count')).toHaveTextContent('3');
    expect(screen.getByText('Sillón Bauhaus')).toBeInTheDocument();
    expect(screen.getByText('Mesa Nogal')).toBeInTheDocument();
    expect(screen.getByText('Silla Viena')).toBeInTheDocument();
  });

  test('filtra productos por término de búsqueda en tiempo real', () => {
    render(
      <MemoryRouter>
        <AdminPanel />
      </MemoryRouter>
    );

    const searchInput = screen.getByLabelText(/Buscar producto en admin/i);
    fireEvent.change(searchInput, { target: { value: 'Bauhaus' } });

    expect(screen.getByText('Sillón Bauhaus')).toBeInTheDocument();
    expect(screen.queryByText('Mesa Nogal')).not.toBeInTheDocument();
    expect(screen.queryByText('Silla Viena')).not.toBeInTheDocument();
  });

  test('filtra productos por categoría', () => {
    render(
      <MemoryRouter>
        <AdminPanel />
      </MemoryRouter>
    );

    const select = screen.getByLabelText(/Filtrar por categoría/i);
    fireEvent.change(select, { target: { value: 'comedor' } });

    expect(screen.queryByText('Sillón Bauhaus')).not.toBeInTheDocument();
    expect(screen.getByText('Mesa Nogal')).toBeInTheDocument();
    expect(screen.getByText('Silla Viena')).toBeInTheDocument();
  });

  test('filtra productos al hacer clic en las tarjetas de stock (KPIs con multi-selección)', () => {
    render(
      <MemoryRouter>
        <AdminPanel />
      </MemoryRouter>
    );

    // 1. Clic en la tarjeta "Sin Stock" (stock: 0)
    const outOfStockCard = screen.getByTitle(/Filtrar por productos sin stock/i);
    fireEvent.click(outOfStockCard);

    // Solo debe verse "Silla Viena" (stock: 0)
    expect(screen.getByText('Silla Viena')).toBeInTheDocument();
    expect(screen.queryByText('Sillón Bauhaus')).not.toBeInTheDocument();
    expect(screen.queryByText('Mesa Nogal')).not.toBeInTheDocument();

    // 2. Clic en la tarjeta "Stock Bajo" (multi-selección: Stock Bajo + Sin Stock)
    const lowStockCard = screen.getByTitle(/Filtrar por productos con stock bajo/i);
    fireEvent.click(lowStockCard);

    // Deben verse ambos ("Silla Viena" y "Mesa Nogal"), pero NO "Sillón Bauhaus"
    expect(screen.getByText('Mesa Nogal')).toBeInTheDocument();
    expect(screen.getByText('Silla Viena')).toBeInTheDocument();
    expect(screen.queryByText('Sillón Bauhaus')).not.toBeInTheDocument();

    // 3. Clic en "Total Productos" para restablecer y deseleccionar los filtros individuales
    const totalCard = screen.getByTitle(/Ver catálogo completo/i);
    fireEvent.click(totalCard);

    expect(screen.getByText('Sillón Bauhaus')).toBeInTheDocument();
    expect(screen.getByText('Mesa Nogal')).toBeInTheDocument();
    expect(screen.getByText('Silla Viena')).toBeInTheDocument();

    // 4. Alternar individual: clic en "Stock Bajo" para activar, y segundo clic para desactivar
    fireEvent.click(lowStockCard);
    expect(screen.getByText('Mesa Nogal')).toBeInTheDocument();
    expect(screen.queryByText('Silla Viena')).not.toBeInTheDocument();

    fireEvent.click(lowStockCard); // Se desactiva y vuelve automáticamente a Total
    expect(screen.getByText('Sillón Bauhaus')).toBeInTheDocument();
    expect(screen.getByText('Mesa Nogal')).toBeInTheDocument();
    expect(screen.getByText('Silla Viena')).toBeInTheDocument();
  });

  test('ordena los productos al hacer clic en las cabeceras de columna', () => {
    render(
      <MemoryRouter>
        <AdminPanel />
      </MemoryRouter>
    );

    // Por defecto ya está ordenado por Nombre Ascendente (A -> Z): Mesa Nogal, Silla Viena, Sillón Bauhaus
    let rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Mesa Nogal');
    expect(rows[2]).toHaveTextContent('Silla Viena');
    expect(rows[3]).toHaveTextContent('Sillón Bauhaus');

    // Clic en Nombre: cambia a Descendente (Z -> A): Sillón Bauhaus, Silla Viena, Mesa Nogal
    const sortNameBtn = screen.getByRole('button', { name: /Ordenar por Nombre/i });
    fireEvent.click(sortNameBtn);
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Sillón Bauhaus');
    expect(rows[2]).toHaveTextContent('Silla Viena');
    expect(rows[3]).toHaveTextContent('Mesa Nogal');

    // Clic nuevamente: vuelve a Ascendente (A -> Z)
    fireEvent.click(sortNameBtn);
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Mesa Nogal');
    expect(rows[2]).toHaveTextContent('Silla Viena');
    expect(rows[3]).toHaveTextContent('Sillón Bauhaus');

    // Ordenar por Precio
    const sortPriceBtn = screen.getByRole('button', { name: /Ordenar por Precio/i });
    fireEvent.click(sortPriceBtn); // Ascendente: 110.000 (Silla), 320.000 (Sillón), 680.000 (Mesa)
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Silla Viena');
    expect(rows[2]).toHaveTextContent('Sillón Bauhaus');
    expect(rows[3]).toHaveTextContent('Mesa Nogal');
  });

  test('el botón de Nuevo Producto apunta a /admin/crear-producto', () => {
    render(
      <MemoryRouter>
        <AdminPanel />
      </MemoryRouter>
    );

    const createBtn = screen.getByRole('link', { name: /Nuevo Producto/i });
    expect(createBtn).toHaveAttribute('href', '/admin/crear-producto');
  });
});
