import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LegalTerms from './LegalTerms';
import LegalPrivacy from './LegalPrivacy';
import LegalReturns from './LegalReturns';
import { RepentanceModalProvider } from '../../context/RepentanceModalContext';
import Footer from '../Footer/Footer';

describe('Navegación cruzada entre secciones Legales', () => {
  const renderLegalWithRouter = (initialRoute = '/terminos-y-condiciones') => {
    return render(
      <RepentanceModalProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/terminos-y-condiciones" element={<LegalTerms />} />
            <Route path="/politica-de-privacidad" element={<LegalPrivacy />} />
            <Route path="/cambios-y-devoluciones" element={<LegalReturns />} />
          </Routes>
          <Footer />
        </MemoryRouter>
      </RepentanceModalProvider>
    );
  };

  test('muestra el menú de pestañas legales en /terminos-y-condiciones', () => {
    renderLegalWithRouter('/terminos-y-condiciones');

    expect(
      screen.getByRole('navigation', {
        name: /secciones legales/i,
      })
    ).toBeInTheDocument();

    const links = screen.getAllByRole('link', {
      name: /política de privacidad/i,
    });
    expect(links.length).toBeGreaterThan(0);

    const returnsLinks = screen.getAllByRole('link', {
      name: /cambios y devoluciones/i,
    });
    expect(returnsLinks.length).toBeGreaterThan(0);
  });

  test('permite abrir el modal de arrepentimiento desde el menú legal', () => {
    renderLegalWithRouter('/cambios-y-devoluciones');

    // Pulsar el botón de arrepentimiento presente en el submenú legal
    const repentanceBtns = screen.getAllByRole('button', {
      name: /botón de arrepentimiento/i,
    });
    fireEvent.click(repentanceBtns[0]);

    expect(
      screen.getByRole('heading', { name: 'Botón de arrepentimiento' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('¿Te arrepentiste de tu compra? Contactanos.')
    ).toBeInTheDocument();
  });

  test('permite abrir el modal de arrepentimiento desde el callout de /cambios-y-devoluciones', () => {
    renderLegalWithRouter('/cambios-y-devoluciones');

    const ctaBtn = screen.getByRole('button', {
      name: /abrir formulario de arrepentimiento/i,
    });
    fireEvent.click(ctaBtn);

    expect(
      screen.getByRole('heading', { name: 'Botón de arrepentimiento' })
    ).toBeInTheDocument();
  });
});
