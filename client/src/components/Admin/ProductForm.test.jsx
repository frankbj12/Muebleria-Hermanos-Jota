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
import ProductForm, { formatSpecs } from './ProductForm';

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
  beforeAll(() => {
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-preview-url');
    global.URL.createObjectURL = window.URL.createObjectURL;
  });

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
    expect(screen.getByLabelText(/Stock Disponible/i)).toHaveValue(0);
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

  test('muestra errores de validación si faltan campos obligatorios o el stock es negativo', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/crear-producto']}>
        <Routes>
          <Route path="/admin/crear-producto" element={<ProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    // Si ingresamos un stock negativo no permitido
    fireEvent.change(screen.getByLabelText(/Stock Disponible/i), {
      target: { value: '-2' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Publicar Mueble/i }));

    expect(await screen.findByText(/El nombre del mueble es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingresá un precio válido mayor a 0/i)).toBeInTheDocument();
    expect(screen.getByText(/El stock debe ser un número entero mayor o igual a 0/i)).toBeInTheDocument();
    // La descripción ya NO es obligatoria
    expect(screen.queryByText(/La descripción del mueble es obligatoria/i)).not.toBeInTheDocument();
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

  test('permite agregar y eliminar especificaciones secundarias y personalizadas con select', () => {
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

    // Cambiar a opción 'otro' (personalizado)
    const selectTipo = screen.getByLabelText(/Tipo de especificación/i);
    expect(selectTipo).toHaveValue('peso');

    fireEvent.change(selectTipo, { target: { value: 'otro' } });

    const keyInput = screen.getByPlaceholderText(/Propiedad \(ej: Estilo, Garantía\)/i);
    const valueInput = screen.getByPlaceholderText(/Valor \(ej: Nórdico, 5 años\)/i);

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

  test('envía los datos correctamente al crear un producto con medidas compuestas (Ancho × Prof × Alto) y especificaciones', async () => {
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

    // Medidas compuestas en 3 inputs
    fireEvent.change(screen.getByLabelText(/Ancho en centímetros/i), {
      target: { value: '90' },
    });
    fireEvent.change(screen.getByLabelText(/Profundidad en centímetros/i), {
      target: { value: '85' },
    });
    fireEvent.change(screen.getByLabelText(/Alto en centímetros/i), {
      target: { value: '95' },
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

  test('carga los datos existentes y divide las medidas compuestas en modo edición con :id', () => {
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

    // Medidas cargadas en Ancho, Profundidad y Alto
    expect(screen.getByLabelText(/Ancho en centímetros/i)).toHaveValue('180');
    expect(screen.getByLabelText(/Profundidad en centímetros/i)).toHaveValue('45');
    expect(screen.getByLabelText(/Alto en centímetros/i)).toHaveValue('75');

    expect(screen.getByLabelText(/Materiales/i)).toHaveValue('Nogal macizo FSC®');

    // Comprobar que cargó la especificación particular "peso" con valor 68 y sufijo
    expect(screen.getByDisplayValue('68')).toBeInTheDocument();

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

  test('crea un producto con stock por defecto 0 y sin descripción si se omiten', async () => {
    mockCreateProduct.mockResolvedValueOnce({ id: 3, name: 'Mesa Arrayán' });

    render(
      <MemoryRouter initialEntries={['/admin/crear-producto']}>
        <Routes>
          <Route path="/admin/crear-producto" element={<ProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Nombre del Mueble/i), {
      target: { value: 'Mesa Arrayán' },
    });
    fireEvent.change(screen.getByLabelText(/Precio en ARS/i), {
      target: { value: '950000' },
    });

    // Dejamos stock en blanco o con su valor por defecto 0, y descripción vacía
    fireEvent.click(screen.getByRole('button', { name: /Publicar Mueble/i }));

    await waitFor(() => {
      expect(mockCreateProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Mesa Arrayán',
          price: 950000,
          stock: 0,
          description: '',
        })
      );
    });
  });

  test('permite arrastrar y soltar (drag & drop) una imagen para iniciar su subida', async () => {
    const mockFetch = jest.fn().mockImplementation((url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ url: 'https://vercel.blob/test-foto.jpg' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ blobs: [] }),
      });
    });
    global.fetch = mockFetch;

    render(
      <MemoryRouter initialEntries={['/admin/crear-producto']}>
        <Routes>
          <Route path="/admin/crear-producto" element={<ProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    // Cambiar a la pestaña de subir archivo
    fireEvent.click(screen.getByRole('tab', { name: /Subir desde mi Computadora/i }));

    const dropzoneText = screen.getByText(/Hacé clic acá para elegir una imagen de tus archivos/i);
    const dropzone = dropzoneText.closest('.admin-dropzone');
    expect(dropzone).toBeInTheDocument();

    const file = new File(['dummy-content'], 'mueble-artesanal.png', { type: 'image/png' });

    // Drag enter activa feedback visual
    fireEvent.dragEnter(dropzone, {
      dataTransfer: { files: [file] },
    });
    expect(screen.getByText(/¡Soltá tu imagen acá para subirla!/i)).toBeInTheDocument();

    // Drop procesa la imagen
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/upload'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  test('helper formatSpecs normaliza medidas compuestas, campos fijos, peso en kg y especificaciones dinámicas', () => {
    const rawData = {
      ancho: '180 cm',
      prof: '45',
      alto: '75 cm',
      materiales: 'Nogal macizo FSC®',
      acabado: 'Aceite natural ecológico',
      peso: '68',
      customSpecs: [
        { clave: 'capacidad', valor: '45 kg por estante' },
        { clave: 'rotacion', valor: '360°' },
      ],
    };

    const result = formatSpecs(rawData);

    expect(result).toEqual({
      medidas: '180 × 45 × 75 cm',
      materiales: 'Nogal macizo FSC®',
      acabado: 'Aceite natural ecológico',
      peso: '68 kg',
      capacidad: '45 kg por estante',
      rotacion: '360°',
    });
  });

  test('helper formatSpecs admite rangos de texto como 160-240 en las medidas', () => {
    const rawData = {
      ancho: '160-240',
      prof: '90',
      alto: '76',
    };

    const result = formatSpecs(rawData);

    expect(result.medidas).toBe('160-240 × 90 × 76 cm');
  });

  test('muestra error de validación si las medidas están incompletas (ej: solo ancho)', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/crear-producto']}>
        <Routes>
          <Route path="/admin/crear-producto" element={<ProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Nombre del Mueble/i), {
      target: { value: 'Mesa Arrayán' },
    });
    fireEvent.change(screen.getByLabelText(/Precio en ARS/i), {
      target: { value: '950000' },
    });

    // Ingresar solo ancho y dejar profundidad/alto vacíos
    fireEvent.change(screen.getByLabelText(/Ancho en centímetros/i), {
      target: { value: '180' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Publicar Mueble/i }));

    expect(
      await screen.findByText(
        /Completá los tres valores de medidas \(ancho, profundidad y alto\) o dejalos vacíos/i
      )
    ).toBeInTheDocument();
    expect(mockCreateProduct).not.toHaveBeenCalled();
  });
});

