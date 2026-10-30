import React from 'react';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Chatbot from './Chatbot';
import {
  processChatbotMessage,
  searchProducts,
  formatCurrency,
  normalizeText,
} from './chatbotEngine';

// Mock de useProducts
const mockProducts = [
  {
    id: 1,
    name: 'Mesa de Centro Araucaria',
    price: 780000,
    stock: 4,
    category: 'living',
    description: 'Mesa de centro con sobre circular de mármol Patagonia.',
    image: 'assets/products/Mesa de Centro Araucaria.png',
  },
  {
    id: 2,
    name: 'Sillón Copacabana',
    price: 1250000,
    stock: 0,
    category: 'living',
    description: 'Sillón lounge en cuero cognac.',
    image: 'assets/products/Sillón Copacabana.png',
  },
];

jest.mock('../../context/ProductsContext', () => ({
  useProducts: () => ({
    products: mockProducts,
    loading: false,
    error: null,
  }),
}));

describe('Chatbot Engine (chatbotEngine.js)', () => {
  test('normalizeText limpia tildes y pasa a minúsculas', () => {
    expect(normalizeText('Sillón COPACABANA')).toBe('sillon copacabana');
    expect(normalizeText('  Garantía  ')).toBe('garantia');
  });

  test('formatCurrency formatea montos en ARS', () => {
    const formatted = formatCurrency(1250000);
    expect(formatted).toContain('1.250.000');
  });

  test('searchProducts encuentra productos por nombre o categoría', () => {
    const results = searchProducts('mesa', mockProducts);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Mesa de Centro Araucaria');

    const categoryResults = searchProducts('living', mockProducts);
    expect(categoryResults).toHaveLength(2);
  });

  test('processChatbotMessage responde a horarios y showroom', () => {
    const response = processChatbotMessage(
      'horarios de atencion',
      mockProducts
    );
    expect(response.text).toContain('San Juan 2847');
    expect(response.text).toContain('10:00 a 19:00');
  });

  test('processChatbotMessage responde a envíos', () => {
    const response = processChatbotMessage('hacen envios?', mockProducts);
    expect(response.text).toContain('envíos a todo el país');
    expect(response.whatsappLink).toBeDefined();
  });

  test('processChatbotMessage responde a materiales y sustentabilidad', () => {
    const response = processChatbotMessage(
      'que materiales usan?',
      mockProducts
    );
    expect(response.text).toContain('FSC');
    expect(response.text).toMatch(/aceite de lino/i);
  });

  test('processChatbotMessage responde a garantía Herencia Viva', () => {
    const response = processChatbotMessage('garantia', mockProducts);
    expect(response.text).toContain('Herencia Viva');
    expect(response.text).toContain('10 años');
  });

  test('processChatbotMessage responde a consultas de whatsapp o asesor', () => {
    const response = processChatbotMessage(
      'necesito hablar con un asesor humano',
      mockProducts
    );
    expect(response.whatsappLink).toContain('541145678900');
  });

  test('processChatbotMessage busca en catálogo y devuelve productos', () => {
    const response = processChatbotMessage('busco una mesa', mockProducts);
    expect(response.products).toBeDefined();
    expect(response.products[0].name).toBe('Mesa de Centro Araucaria');
  });
});

describe('Chatbot Component (Chatbot.jsx)', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renderiza el botón flotante de chat cerrado inicialmente', () => {
    render(
      <MemoryRouter>
        <Chatbot />
      </MemoryRouter>
    );

    const fab = screen.getByRole('button', {
      name: /abrir asistente de atención al cliente/i,
    });
    expect(fab).toBeInTheDocument();
    expect(fab).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('abre la ventana de chat al hacer clic en el botón flotante', () => {
    render(
      <MemoryRouter>
        <Chatbot />
      </MemoryRouter>
    );

    const fab = screen.getByRole('button', {
      name: /abrir asistente de atención al cliente/i,
    });
    fireEvent.click(fab);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByAltText(/logo hermanos jota/i)).toBeInTheDocument();
    expect(screen.getByText('Hermanos Jota')).toBeInTheDocument();
    expect(
      screen.getByText(/¡Hola! Te damos la bienvenida a Hermanos Jota/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Escribí tu consulta aquí.../i)
    ).toBeInTheDocument();
  });

  test('cierra la ventana de chat al presionar el botón de cerrar', () => {
    render(
      <MemoryRouter>
        <Chatbot />
      </MemoryRouter>
    );

    const fab = screen.getByRole('button', {
      name: /abrir asistente de atención al cliente/i,
    });
    fireEvent.click(fab);

    const closeBtn = screen.getByRole('button', { name: /cerrar chat/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('permite enviar un mensaje escrito y recibir respuesta del bot', async () => {
    render(
      <MemoryRouter>
        <Chatbot />
      </MemoryRouter>
    );

    // Abrir chat
    fireEvent.click(
      screen.getByRole('button', {
        name: /abrir asistente de atención al cliente/i,
      })
    );

    const input = screen.getByPlaceholderText(/Escribí tu consulta aquí.../i);
    const sendBtn = screen.getByRole('button', { name: /enviar mensaje/i });

    // Escribir consulta sobre showroom
    fireEvent.change(input, { target: { value: 'donde queda el showroom?' } });
    fireEvent.click(sendBtn);

    // Se renderiza el mensaje del usuario
    expect(screen.getByText('donde queda el showroom?')).toBeInTheDocument();

    // Avanzar timers para simular tiempo de respuesta
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(await screen.findByText(/Av\. San Juan 2847/i)).toBeInTheDocument();
  });

  test('muestra opciones rápidas y responde al seleccionarlas', async () => {
    render(
      <MemoryRouter>
        <Chatbot />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /abrir asistente de atención al cliente/i,
      })
    );

    // Clic en la opción rápida de materiales
    const materialChip = screen.getByRole('button', {
      name: /materiales sustentables/i,
    });
    fireEvent.click(materialChip);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(
      await screen.findByText(/FSC® de manejo responsable/i)
    ).toBeInTheDocument();
  });

  test('muestra productos dinámicamente al consultar por muebles', async () => {
    render(
      <MemoryRouter>
        <Chatbot />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /abrir asistente de atención al cliente/i,
      })
    );

    const input = screen.getByPlaceholderText(/Escribí tu consulta aquí.../i);
    const sendBtn = screen.getByRole('button', { name: /enviar mensaje/i });

    fireEvent.change(input, { target: { value: 'mesa' } });
    fireEvent.click(sendBtn);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(
      await screen.findByText('Mesa de Centro Araucaria')
    ).toBeInTheDocument();
    expect(screen.getByText('En stock')).toBeInTheDocument();
  });

  test('ofrece enlace directo a WhatsApp', async () => {
    render(
      <MemoryRouter>
        <Chatbot />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /abrir asistente de atención al cliente/i,
      })
    );

    const whatsappChip = screen.getByRole('button', {
      name: /hablar con un asesor/i,
    });
    fireEvent.click(whatsappChip);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    const waLink = await screen.findByRole('link', {
      name: /hablar con un asesor por whatsapp/i,
    });
    expect(waLink).toBeInTheDocument();
    expect(waLink).toHaveAttribute(
      'href',
      expect.stringContaining('541145678900')
    );
  });

  test('permite reiniciar la conversación', async () => {
    render(
      <MemoryRouter>
        <Chatbot />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /abrir asistente de atención al cliente/i,
      })
    );

    const input = screen.getByPlaceholderText(/Escribí tu consulta aquí.../i);
    const sendBtn = screen.getByRole('button', { name: /enviar mensaje/i });

    fireEvent.change(input, { target: { value: 'hola' } });
    fireEvent.click(sendBtn);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Reiniciar chat
    const resetBtn = screen.getByRole('button', {
      name: /reiniciar conversación/i,
    });
    fireEvent.click(resetBtn);

    expect(screen.queryByText('hola')).not.toBeInTheDocument();
    expect(
      screen.getByText(/¡Hola! Te damos la bienvenida a Hermanos Jota/i)
    ).toBeInTheDocument();
  });
});
