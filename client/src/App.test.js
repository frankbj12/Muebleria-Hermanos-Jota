import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('navigates between views and product detail without reloading', async () => {
  window.history.pushState({}, '', '/');
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
  await userEvent.click(screen.getByRole('link', { name: 'Explorar colección' }));
  expect(await screen.findByRole('heading', { name: 'Catálogo Completo' })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('link', { name: /Ver detalle/ }));
  expect(await screen.findByRole('heading', { name: 'Butaca Mendoza' })).toBeInTheDocument();
  expect(window.location.search).toBe('?id=1');

  await userEvent.click(screen.getByRole('button', { name: 'Añadir al Carrito' }));
  expect(document.querySelector('#cart-count')).toHaveTextContent('1');
  await userEvent.click(screen.getByRole('link', { name: 'Carrito de compras' }));
  expect(await screen.findByRole('heading', { name: 'Butaca Mendoza' })).toBeInTheDocument();
  expect(screen.getByText('1 unidad')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Quitar' }));
  expect(await screen.findByText('Tu carrito está vacío')).toBeInTheDocument();
  expect(document.querySelector('#cart-count')).toHaveTextContent('0');

  await userEvent.click(screen.getAllByRole('link', { name: 'Contacto' })[0]);
  expect(await screen.findByRole('heading', { name: 'Contacto' })).toBeInTheDocument();
});
