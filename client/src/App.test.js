import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('navigates between views and product detail without reloading', async () => {
  window.history.pushState({}, '', '/');
  const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => [
      {
        id: 1,
        name: 'Butaca Mendoza',
        category: 'living',
        description: 'Butaca de prueba',
        price: 890000,
        image: 'assets/products/butaca.png',
        featured: true,
        specs: {},
      },
    ],
  });

  render(<App />);

  await screen.findByRole('heading', { name: 'Redescubrí el arte de vivir' });
  scrollTo.mockClear();
  await userEvent.click(
    screen.getByRole('link', { name: 'Explorar colección' })
  );
  expect(scrollTo).toHaveBeenCalledWith(0, 0);
  expect(
    await screen.findByRole('heading', { name: 'Nuestra Colección' })
  ).toBeInTheDocument();

  await userEvent.click(screen.getByRole('link', { name: /Ver detalle/ }));
  expect(
    await screen.findByRole('heading', { name: 'Butaca Mendoza' })
  ).toBeInTheDocument();
  expect(window.location.search).toBe('?id=1');

  await userEvent.click(
    screen.getByRole('button', { name: 'Añadir al Carrito' })
  );
  expect(document.querySelector('#cart-count')).toHaveTextContent('1');
  await userEvent.click(
    screen.getByRole('link', { name: 'Carrito de compras' })
  );
  expect(
    await screen.findByRole('heading', { name: 'Butaca Mendoza' })
  ).toBeInTheDocument();
  expect(document.querySelector('.qty-value')).toHaveTextContent('1');

  await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
  expect(
    await screen.findByText('Aún no agregaste piezas a tu carrito')
  ).toBeInTheDocument();
  expect(document.querySelector('#cart-count')).toHaveTextContent('0');

  await userEvent.click(screen.getAllByRole('link', { name: 'Contacto' })[0]);
  expect(
    await screen.findByRole('heading', { name: 'Contacto' })
  ).toBeInTheDocument();
});
