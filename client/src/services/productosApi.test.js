import productosApi from './productosApi';

const configuredApiUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '');
const API_URL = configuredApiUrl
  ? configuredApiUrl.endsWith('/api/productos')
    ? configuredApiUrl
    : `${configuredApiUrl}/api/productos`
  : 'http://localhost:5000/api/productos';

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 404 ? 'Not Found' : 'OK',
  headers: { get: () => 'application/json' },
  json: jest.fn().mockResolvedValue(body),
});

describe('productosApi', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('obtiene todos los productos', async () => {
    const products = [{ id: 1, name: 'Mesa' }];
    global.fetch.mockResolvedValue(jsonResponse(products));

    await expect(productosApi.getAll()).resolves.toEqual([
      {
        id: 1,
        name: 'Mesa',
        description: '',
        image: '',
        category: 'general',
        featured: false,
        specs: {},
      },
    ]);
    expect(global.fetch).toHaveBeenCalledWith(
      API_URL,
      { signal: undefined }
    );
  });

  it('convierte los campos en español de Render al contrato en inglés', async () => {
    global.fetch.mockResolvedValue(
      jsonResponse([
        {
          id: 'mongo-product-id',
          nombre: 'Aparador Uspallata',
          descripcion: 'Aparador de nogal',
          precio: 112399,
          imagen: '/imagenes/aparador.png',
          categoria: 'almacenamiento',
          destacado: true,
          detalles: { medidas: '180 × 45 × 75 cm' },
          stock: 4,
        },
      ])
    );

    const [product] = await productosApi.getAll();
    expect(product).toEqual({
      id: 'mongo-product-id',
      name: 'Aparador Uspallata',
      description: 'Aparador de nogal',
      price: 112399,
      image: '/imagenes/aparador.png',
      category: 'almacenamiento',
      featured: true,
      specs: { medidas: '180 × 45 × 75 cm' },
      stock: 4,
    });
    expect(product).not.toHaveProperty('_id');
    expect(product).not.toHaveProperty('nombre');
    expect(product).not.toHaveProperty('precio');
    expect(product).not.toHaveProperty('imagen');
    expect(product).not.toHaveProperty('detalles');
  });

  it('expone como id el _id de MongoDB', async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ _id: 'mongo-object-id', name: 'Mesa', price: 100 })
    );

    await expect(
      productosApi.getById('mongo-object-id')
    ).resolves.toMatchObject({ id: 'mongo-object-id' });
  });

  it('obtiene un producto por ID codificando el parámetro', async () => {
    const product = { id: 'product/1', name: 'Mesa' };
    global.fetch.mockResolvedValue(jsonResponse(product));

    await expect(productosApi.getById('product/1')).resolves.toMatchObject({
      id: 'product/1',
      name: 'Mesa',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/product%2F1`,
      { signal: undefined }
    );
  });

  it('crea un producto enviando JSON', async () => {
    const product = { name: 'Mesa nueva', price: 100 };
    global.fetch.mockResolvedValue(
      jsonResponse({ id: 'product-1', nombre: 'Mesa nueva', precio: 100 }, 201)
    );

    await expect(productosApi.create(product)).resolves.toMatchObject({
      id: 'product-1',
      name: 'Mesa nueva',
      price: 100,
    });
    expect(global.fetch).toHaveBeenCalledWith(
      API_URL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      }
    );
  });

  it('actualiza un producto por ID', async () => {
    const product = { name: 'Mesa editada', price: 120 };
    global.fetch.mockResolvedValue(
      jsonResponse({ id: 'product-1', nombre: 'Mesa editada', precio: 120 })
    );

    await expect(
      productosApi.update('product-1', product)
    ).resolves.toMatchObject({
      id: 'product-1',
      name: 'Mesa editada',
      price: 120,
    });
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/product-1`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      }
    );
  });

  it('elimina un producto y acepta una respuesta 204', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 204,
      statusText: 'No Content',
      headers: { get: () => null },
    });

    await expect(productosApi.remove('product-1')).resolves.toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/product-1`,
      { method: 'DELETE' }
    );
  });

  it('normaliza el producto dentro de la respuesta de eliminación', async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({
        message: 'Producto eliminado',
        producto: { id: 'product-1', nombre: 'Mesa', precio: 100 },
      })
    );

    await expect(productosApi.remove('product-1')).resolves.toEqual({
      message: 'Producto eliminado',
      product: {
        id: 'product-1',
        name: 'Mesa',
        description: '',
        price: 100,
        image: '',
        category: 'general',
        featured: false,
        specs: {},
      },
    });
  });

  it('propaga el mensaje y estado de error de la API', async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ error: 'Producto no encontrado' }, 404)
    );

    await expect(productosApi.getById('missing')).rejects.toMatchObject({
      message: 'Producto no encontrado',
      status: 404,
    });
  });
});
