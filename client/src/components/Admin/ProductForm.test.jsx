import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const router = require('react-router');
  return {
    ...router,
    useNavigate: () => mockNavigate,
    Link: ({ to, children, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

import { MemoryRouter, Route, Routes } from 'react-router';
import ProductForm from './ProductForm';

const mockProducts = [
  {
    id: 1,
    name: 'Aparador Uspallata',
    category: 'almacenamiento',
    description: 'Aparador de seis puertas fabricado en nogal sostenible.',
    price: 1890000,
    stock: 6,
    featured: true,
    image: 'assets/products/Aparador Uspallata.png',
    specs: {
      medidas: '180 × 45 × 75 cm',
      materiales: 'Nogal macizo FSC®',
      acabado: 'Aceite natural ecológico',
      peso: '68 kg',
    },
  },
];

const mockCreateProduct = jest.fn();
const mockUpdateProduct = jest.fn();
const mockAddToast = jest.fn();

jest.mock('../../context/ProductsContext', () => ({
  useProducts: () => ({
    products: mockProducts,
    loading: false,
    createProduct: mockCreateProduct,
    updateProduct: mockUpdateProduct,
  }),
}));

jest.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

describe('ProductForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza formulario de alta con pestañas de imagen, galería visual y vista previa', () => {
    render(
      <MemoryRouter initialEntries={['/admin/crear-producto']}>
        <Routes>
          <Route path="/admin/crear-producto" element={<ProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Alta de Nuevo Mueble/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del Mueble/i)).toHaveValue('');
    expect(screen.getByLabelText(/Categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Precio en ARS/i)).toHaveValue(null);
    expect(screen.getByLabelText(/Stock Disponible/i)).toHaveValue(null);
    expect(screen.getByLabelText(/Descripción Artesanal/i)).toHaveValue('');

    // Pestañas de selector de imagen
    expect(screen.getByRole('tab', { name: /Galería Visual del Catálogo/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Subir desde mi Computadora/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Pegar URL Web/i })).toBeInTheDocument();

    // Galería visual visible por defecto con miniaturas
    expect(screen.getByTitle(/Seleccionar Aparador Uspallata/i)).toBeInTheDocument();
  });

  test('permite cambiar entre pestañas de imagen (subir archivo y pegar URL)', () => {
    render(
      <MemoryRouter initialEntries={['/admin/crear-producto']}>
        <Routes>
          <Route path="/admin/crear-producto" element={<ProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    // Cambiar a subir archivo
    fireEvent.click(screen.getByRole('tab', { name: /Subir desde mi Computadora/i }));
    expect(
      screen.getByText(/Hacé clic acá para elegir una imagen de tus archivos/i)
    ).toBeInTheDocument();

    // Cambiar a pegar URL
    fireEvent.click(screen.getByRole('tab', { name: /Pegar URL Web/i }));
    expect(screen.getByLabelText(/Ruta relativa o URL de la imagen/i)).toBeInTheDocument();
  });

  test('muestra errores de validación si se envía el formulario sin campos obligatorios', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/crear-producto']}>
        <Routes>
          <Route path="/admin/crear-producto" element={<ProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Publicar Mueble/i }));

    expect(await screen.findByText(/El nombre del mueble es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingresá un precio válido mayor a 0/i)).toBeInTheDocument();
    expect(screen.getByText(/El stock debe ser un número entero mayor o igual a 0/i)).toBeInTheDocument();
    expect(screen.getByText(/La descripción del mueble es obligatoria/i)).toBeInTheDocument();
    expect(mockCreateProduct).not.toHaveBeenCalled();
  });

  test('seleccionar imagen de la galería visual actualiza la vista previa', () => {
    render(
      <MemoryRouter initialEntries={['/admin/crear-producto']}>
        <Routes>
          <Route path="/admin/crear-producto" element={<ProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    const galleryCard = screen.getByTitle(/Seleccionar Butaca Mendoza/i);
    fireEvent.click(galleryCard);

    // Debe mostrarse seleccionado con su badge
    expect(galleryCard).toHaveClass('admin-gallery-card--selected');
  });

  test('permite agregar y eliminar especificaciones personalizadas opcionales', () => {
    render(
      <MemoryRouter initialEntries={['/admin/crear-producto']}>
        <Routes>
          <Route path="/admin/crear-producto" element={<ProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    const addSpecBtn = screen.getByRole('button', {
      name: /\+ Agregar otra especificación personalizada/i,
    });
    fireEvent.click(addSpecBtn);

    const keyInput = screen.getByPlaceholderText(/Propiedad \(ej: Peso, Rotación, Tapizado\)/i);
    const valueInput = screen.getByPlaceholderText(/Valor \(ej: 42 kg, 360°, Bouclé Rose\)/i);

    fireEvent.change(keyInput, { target: { value: 'Capacidad' } });
    fireEvent.change(valueInput, { target: { value: '45 kg por estante' } });

    // En la vista previa debe mostrar la nueva especificación
    expect(screen.getByText(/Capacidad:/i)).toBeInTheDocument();
    expect(screen.getByText(/45 kg por estante/i)).toBeInTheDocument();

    // Eliminar la especificación
    const removeBtn = screen.getByRole('button', { name: /Eliminar especificación/i });
    fireEvent.click(removeBtn);

    expect(screen.queryByText(/Capacidad:/i)).not.toBeInTheDocument();
  });

  test('envía los datos correctamente al crear un producto con especificaciones opcionales', async () => {
    mockCreateProduct.mockResolvedValueOnce({ id: 2, name: 'Sillón Copacabana' });

    render(
      <MemoryRouter initialEntries={['/admin/crear-producto']}>
        <Routes>
          <Route path="/admin/crear-producto" element={<ProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Nombre del Mueble/i), {
      target: { value: 'Sillón Copacabana' },
    });
    fireEvent.change(screen.getByLabelText(/Precio en ARS/i), {
      target: { value: '750000' },
    });
    fireEvent.change(screen.getByLabelText(/Stock Disponible/i), {
      target: { value: '4' },
    });
    fireEvent.change(screen.getByLabelText(/Descripción Artesanal/i), {
      target: { value: 'Sillón tapizado en lino con patas en madera de haya maciza.' },
    });

    // Especificación opcional de medidas
    fireEvent.change(screen.getByLabelText(/Medidas/i), {
      target: { value: '90 × 85 × 95 cm' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Publicar Mueble/i }));

    await waitFor(() => {
      expect(mockCreateProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sillón Copacabana',
          price: 750000,
          stock: 4,
          category: 'living',
          specs: expect.objectContaining({
            medidas: '90 × 85 × 95 cm',
          }),
        })
      );
    });

    expect(mockAddToast).toHaveBeenCalledWith(
      expect.stringContaining('Sillón Copacabana'),
      'success'
    );
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

  test('carga los datos existentes y especificaciones particulares en modo edición con :id', () => {
    render(
      <MemoryRouter initialEntries={['/admin/editar-producto/1']}>
        <Routes>
          <Route path="/admin/editar-producto/:id" element={<ProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Editar Mueble #1/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del Mueble/i)).toHaveValue('Aparador Uspallata');
    expect(screen.getByLabelText(/Precio en ARS/i)).toHaveValue(1890000);
    expect(screen.getByLabelText(/Stock Disponible/i)).toHaveValue(6);
    expect(screen.getByLabelText(/Medidas/i)).toHaveValue('180 × 45 × 75 cm');
    expect(screen.getByLabelText(/Materiales/i)).toHaveValue('Nogal macizo FSC®');

    // Comprobar que cargó la especificación particular "peso"
    expect(screen.getByDisplayValue('peso')).toBeInTheDocument();
    expect(screen.getByDisplayValue('68 kg')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Guardar Cambios/i })).toBeInTheDocument();
  });

  test('muestra estado de no encontrado si el ID para editar no existe', () => {
    render(
      <MemoryRouter initialEntries={['/admin/editar-producto/999']}>
        <Routes>
          <Route path="/admin/editar-producto/:id" element={<ProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Mueble no encontrado/i })).toBeInTheDocument();
    expect(screen.getByText(/No se encontró ningún producto con el identificador #999/i)).toBeInTheDocument();
  });
});
