import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

describe('Footer y Botón de arrepentimiento', () => {
  const renderFooter = () => {
    return render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
  };

  test('renderiza enlaces legales en el footer', () => {
    renderFooter();

    expect(screen.getByText('Términos y condiciones')).toBeInTheDocument();
    expect(screen.getByText('Política de privacidad')).toBeInTheDocument();
    expect(
      screen.getByText('Política de cambios y devoluciones')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /botón de arrepentimiento/i })
    ).toBeInTheDocument();
  });

  test('abre el modal de arrepentimiento al pulsar el botón del footer', () => {
    renderFooter();

    const repentanceBtn = screen.getByRole('button', {
      name: /botón de arrepentimiento/i,
    });
    fireEvent.click(repentanceBtn);

    expect(
      screen.getByRole('heading', { name: 'Botón de arrepentimiento' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('¿Te arrepentiste de tu compra? Contactanos.')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. Juan Pérez')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. 11 2345-6789')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('ejemplo@correo.com')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. ORD-12345')).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /¿qué pasó con tu compra\?/i })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        'Detallá cualquier observación o indicación extra...'
      )
    ).toBeInTheDocument();
  });

  test('valida campos obligatorios y formato de email en el modal', () => {
    renderFooter();

    // Abrir modal
    fireEvent.click(
      screen.getByRole('button', { name: /botón de arrepentimiento/i })
    );

    // Intentar enviar formulario vacío
    const submitBtn = screen.getByRole('button', { name: /enviar solicitud/i });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText('Ingresá tu nombre y apellido.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ingresá un teléfono de contacto.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ingresá tu correo electrónico.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ingresá el número de tu orden de compra.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Por favor seleccioná una opción.')
    ).toBeInTheDocument();

    // Validar email inválido
    fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
      target: { value: 'emailinvalido' },
    });
    fireEvent.click(submitBtn);
    expect(
      screen.getByText(/ingresá un formato de email válido/i)
    ).toBeInTheDocument();
  });

  test('completa formulario, simula envío exitoso y permite cerrar', () => {
    renderFooter();

    fireEvent.click(
      screen.getByRole('button', { name: /botón de arrepentimiento/i })
    );

    // Llenar datos válidos
    fireEvent.change(screen.getByPlaceholderText('Ej. Juan Pérez'), {
      target: { value: 'Laura Martínez' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ej. 11 2345-6789'), {
      target: { value: '1133445566' },
    });
    fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
      target: { value: 'laura@ejemplo.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ej. ORD-12345'), {
      target: { value: 'ORD-98765' },
    });
    fireEvent.change(
      screen.getByRole('combobox', { name: /¿qué pasó con tu compra\?/i }),
      {
        target: { value: 'cambio_opinion' },
      }
    );
    fireEvent.change(
      screen.getByPlaceholderText(
        'Detallá cualquier observación o indicación extra...'
      ),
      {
        target: { value: 'Deseo cancelar antes de la entrega' },
      }
    );

    // Enviar
    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }));

    // Confirmación de éxito
    expect(screen.getByText('¡Solicitud recibida!')).toBeInTheDocument();
    expect(screen.getByText(/código de gestión:/i)).toBeInTheDocument();

    // Botón para cerrar
    const closeSuccessBtn = screen.getByRole('button', {
      name: /entendido y cerrar/i,
    });
    fireEvent.click(closeSuccessBtn);

    expect(
      screen.queryByRole('heading', { name: 'Botón de arrepentimiento' })
    ).not.toBeInTheDocument();
  });

  test('cierra el modal con la tecla Escape', () => {
    renderFooter();

    fireEvent.click(
      screen.getByRole('button', { name: /botón de arrepentimiento/i })
    );
    expect(
      screen.getByRole('heading', { name: 'Botón de arrepentimiento' })
    ).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(
      screen.queryByRole('heading', { name: 'Botón de arrepentimiento' })
    ).not.toBeInTheDocument();
  });
});
