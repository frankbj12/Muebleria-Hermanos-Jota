import productosApi from './productosApi';

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

    await expect(productosApi.getAll()).resolves.toEqual(products);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/productos',
      { signal: undefined }
    );
  });

  it('obtiene un producto por ID codificando el parámetro', async () => {
    const product = { id: 'product/1', name: 'Mesa' };
    global.fetch.mockResolvedValue(jsonResponse(product));

    await expect(productosApi.getById('product/1')).resolves.toEqual(product);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/productos/product%2F1',
      { signal: undefined }
    );
  });

  it('crea un producto enviando JSON', async () => {
    const product = { nombre: 'Mesa nueva', precio: 100 };
    global.fetch.mockResolvedValue(jsonResponse(product, 201));

    await expect(productosApi.create(product)).resolves.toEqual(product);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/productos',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      }
    );
  });

  it('actualiza un producto por ID', async () => {
    const product = { nombre: 'Mesa editada', precio: 120 };
    global.fetch.mockResolvedValue(jsonResponse(product));

    await expect(productosApi.update('product-1', product)).resolves.toEqual(
      product
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/productos/product-1',
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
      'http://localhost:5000/api/productos/product-1',
      { method: 'DELETE' }
    );
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
