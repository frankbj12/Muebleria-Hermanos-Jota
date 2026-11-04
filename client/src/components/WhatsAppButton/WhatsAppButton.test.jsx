import React from 'react';
import { render, screen } from '@testing-library/react';
import WhatsAppButton from './WhatsAppButton';

describe('WhatsAppButton Component', () => {
  test('renderiza el enlace flotante con la URL de WhatsApp oficial', () => {
    render(<WhatsAppButton />);

    const link = screen.getByRole('link', {
      name: /contactar por whatsapp a hermanos jota/i,
    });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/541145678900')
    );
  });

  test('renderiza el tooltip con el texto correspondiente', () => {
    render(<WhatsAppButton tooltipText="Consultar por WhatsApp" />);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Consultar por WhatsApp');
  });

  test('permite personalizar el mensaje predeterminado', () => {
    render(
      <WhatsAppButton
        message="Hola, necesito información sobre el sillón Copacabana"
        phone="541145678900"
      />
    );

    const link = screen.getByRole('link', {
      name: /contactar por whatsapp a hermanos jota/i,
    });

    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(
        encodeURIComponent(
          'Hola, necesito información sobre el sillón Copacabana'
        )
      )
    );
  });
});
