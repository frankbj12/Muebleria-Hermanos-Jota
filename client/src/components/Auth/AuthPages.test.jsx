import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';

const mockNavigate = jest.fn();
let mockLocationState = null;

jest.mock('react-router-dom', () => {
  const router = require('react-router');
  return {
    ...router,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: '/login',
      search: '',
      hash: '',
      state: mockLocationState,
    }),
    Link: ({ to, children, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

import { MemoryRouter } from 'react-router';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

const mockLogin = jest.fn();
const mockRegister = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    isAuthenticated: false,
    user: null,
  }),
}));

const mockAddToast = jest.fn();

jest.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationState = null;
  });

  it('renderiza correctamente el formulario de login y sus elementos', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /iniciar sesión/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /ingresar a mi cuenta/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /crear cuenta/i })).toHaveAttribute(
      'href',
      '/registro'
    );
  });

  it('valida campos requeridos y formato de email al enviar vacío', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole('button', { name: /ingresar a mi cuenta/i })
    );

    expect(
      await screen.findByText('El correo electrónico es requerido.')
    ).toBeInTheDocument();
    expect(screen.getByText('La contraseña es requerida.')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('valida formato de correo inválido', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'correo-invalido' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña/i), {
      target: { value: '123456' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /ingresar a mi cuenta/i })
    );

    expect(
      await screen.findByText('Ingresá un correo electrónico válido.')
    ).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('inicia sesión exitosamente y redirige al inicio por defecto', async () => {
    mockLogin.mockResolvedValueOnce({
      id: '123',
      name: 'Camilo Desza',
      email: 'camilo@example.com',
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'camilo@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña/i), {
      target: { value: 'secreto123' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /ingresar a mi cuenta/i })
    );

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'camilo@example.com',
        password: 'secreto123',
      });
      expect(mockAddToast).toHaveBeenCalledWith(
        '¡Bienvenido de nuevo, Camilo Desza!',
        'success'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('redirige a la ruta previa si existía en location.state.from', async () => {
    mockLocationState = { from: { pathname: '/carrito' } };
    mockLogin.mockResolvedValueOnce({
      id: '123',
      name: 'Martina',
      email: 'martina@example.com',
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'martina@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña/i), {
      target: { value: 'secreto123' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /ingresar a mi cuenta/i })
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/carrito', { replace: true });
    });
  });

  it('muestra mensaje de alerta accesible ante error de autenticación', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciales incorrectas'));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'camilo@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña/i), {
      target: { value: 'passwordErroneo' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /ingresar a mi cuenta/i })
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Credenciales incorrectas'
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('permite alternar la visibilidad de la contraseña con el botón del ojo', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/^contraseña/i);
    const toggleButton = screen.getByRole('button', {
      name: /ver contraseña/i,
    });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(
      screen.getByRole('button', { name: /ocultar contraseña/i })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /ocultar contraseña/i })
    );
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('permite abrir el modal de recuperacion de contrasena y enviar instrucciones', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const forgotBtn = screen.getByRole('button', {
      name: /¿olvidaste tu contraseña\?/i,
    });
    fireEvent.click(forgotBtn);

    const modal = screen.getByRole('dialog');
    expect(
      within(modal).getByRole('heading', { name: /recuperar contraseña/i })
    ).toBeInTheDocument();

    const recoveryInput = within(modal).getByLabelText(/correo electrónico/i);
    fireEvent.change(recoveryInput, { target: { value: 'camilo@test.com' } });

    fireEvent.click(
      within(modal).getByRole('button', { name: /enviar instrucciones/i })
    );

    expect(
      await within(modal).findByText(/si la dirección/i)
    ).toBeInTheDocument();
    expect(mockAddToast).toHaveBeenCalledWith(
      expect.stringContaining('camilo@test.com'),
      'info'
    );
  });

  it('muestra el acceso a recuperar contrasena dentro de la alerta si falla el login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciales incorrectas'));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'camilo@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña/i), {
      target: { value: 'passwordErroneo' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /ingresar a mi cuenta/i })
    );

    const recoveryLink = await screen.findByRole('button', {
      name: /¿olvidaste tu contraseña\? recuperala acá/i,
    });
    expect(recoveryLink).toBeInTheDocument();

    fireEvent.click(recoveryLink);
    expect(
      screen.getByRole('heading', { name: /recuperar contraseña/i })
    ).toBeInTheDocument();
  });
});

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationState = null;
  });

  it('renderiza correctamente el formulario de registro y sus campos', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /crear cuenta/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre y apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/contraseña \(mínimo 6 caracteres\)/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /registrarme/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /iniciar sesión/i })
    ).toHaveAttribute('href', '/login');
  });

  it('valida nombre menor a 3 caracteres y contraseñas no coincidentes', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre y apellido/i), {
      target: { value: 'Lu' },
    });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'lu@test.com' },
    });
    fireEvent.change(
      screen.getByLabelText(/contraseña \(mínimo 6 caracteres\)/i),
      {
        target: { value: '123456' },
      }
    );
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: '654321' },
    });

    fireEvent.click(screen.getByRole('button', { name: /registrarme/i }));

    expect(
      await screen.findByText('El nombre debe tener al menos 3 caracteres.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Las contraseñas no coinciden.')
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('valida contraseña menor a 6 caracteres', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre y apellido/i), {
      target: { value: 'Lucas Gómez' },
    });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'lucas@test.com' },
    });
    fireEvent.change(
      screen.getByLabelText(/contraseña \(mínimo 6 caracteres\)/i),
      {
        target: { value: '123' },
      }
    );
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: '123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /registrarme/i }));

    expect(
      await screen.findByText('La contraseña debe tener al menos 6 caracteres.')
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('valida que la contraseña contenga mayúscula, minúscula, número y caracter especial', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/nombre y apellido/i);
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(
      /contraseña \(mínimo 6 caracteres\)/i
    );
    const confirmInput = screen.getByLabelText(/confirmar contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /registrarme/i });

    fireEvent.change(nameInput, { target: { value: 'Lucas Gómez' } });
    fireEvent.change(emailInput, { target: { value: 'lucas@test.com' } });

    // Sin mayúsculas (solo minúsculas, números y símbolos)
    fireEvent.change(passwordInput, { target: { value: 'abcdef1!' } });
    fireEvent.change(confirmInput, { target: { value: 'abcdef1!' } });
    fireEvent.click(submitBtn);
    expect(
      await screen.findByText(
        'La contraseña debe incluir al menos una letra mayúscula.'
      )
    ).toBeInTheDocument();

    // Sin minúsculas (solo mayúsculas, números y símbolos)
    fireEvent.change(passwordInput, { target: { value: 'ABCDEF1!' } });
    fireEvent.change(confirmInput, { target: { value: 'ABCDEF1!' } });
    fireEvent.click(submitBtn);
    expect(
      await screen.findByText(
        'La contraseña debe incluir al menos una letra minúscula.'
      )
    ).toBeInTheDocument();

    // Sin números (solo mayúsculas, minúsculas y símbolos)
    fireEvent.change(passwordInput, { target: { value: 'Abcdef!' } });
    fireEvent.change(confirmInput, { target: { value: 'Abcdef!' } });
    fireEvent.click(submitBtn);
    expect(
      await screen.findByText('La contraseña debe incluir al menos un número.')
    ).toBeInTheDocument();

    // Sin caracteres especiales (solo mayúsculas, minúsculas y números)
    fireEvent.change(passwordInput, { target: { value: 'Abcdef1' } });
    fireEvent.change(confirmInput, { target: { value: 'Abcdef1' } });
    fireEvent.click(submitBtn);
    expect(
      await screen.findByText(
        'La contraseña debe incluir al menos un carácter especial (ej. !@#$%&*).'
      )
    ).toBeInTheDocument();
  });

  it('permite contraseñas seguras que contienen espacios (passphrases)', async () => {
    mockRegister.mockResolvedValueOnce({
      id: '789',
      name: 'Lucas Gómez',
      email: 'lucas@test.com',
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre y apellido/i), {
      target: { value: 'Lucas Gómez' },
    });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'lucas@test.com' },
    });
    fireEvent.change(
      screen.getByLabelText(/contraseña \(mínimo 6 caracteres\)/i),
      {
        target: { value: 'Mi Mueble Favorito 2026!' },
      }
    );
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: 'Mi Mueble Favorito 2026!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /registrarme/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Lucas Gómez',
        email: 'lucas@test.com',
        password: 'Mi Mueble Favorito 2026!',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('registra exitosamente un nuevo usuario y redirige al inicio', async () => {
    mockRegister.mockResolvedValueOnce({
      id: '456',
      name: 'Lucas Gómez',
      email: 'lucas@test.com',
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre y apellido/i), {
      target: { value: 'Lucas Gómez' },
    });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'lucas@test.com' },
    });
    fireEvent.change(
      screen.getByLabelText(/contraseña \(mínimo 6 caracteres\)/i),
      {
        target: { value: 'Secreto123!' },
      }
    );
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: 'Secreto123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /registrarme/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Lucas Gómez',
        email: 'lucas@test.com',
        password: 'Secreto123!',
      });
      expect(mockAddToast).toHaveBeenCalledWith(
        '¡Cuenta creada con éxito! Bienvenido, Lucas Gómez.',
        'success'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('muestra mensaje de alerta accesible si el registro falla en el servidor', async () => {
    mockRegister.mockRejectedValueOnce(
      new Error('El correo electrónico ya se encuentra registrado.')
    );

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre y apellido/i), {
      target: { value: 'Lucas Gómez' },
    });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'lucas@test.com' },
    });
    fireEvent.change(
      screen.getByLabelText(/contraseña \(mínimo 6 caracteres\)/i),
      {
        target: { value: 'Secreto123!' },
      }
    );
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: 'Secreto123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /registrarme/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El correo electrónico ya se encuentra registrado.'
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('permite alternar la visibilidad de contraseña y confirmar contraseña', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(
      /contraseña \(mínimo 6 caracteres\)/i
    );
    const confirmInput = screen.getByLabelText(/confirmar contraseña/i);

    const togglePassword = screen.getByRole('button', {
      name: 'Ver contraseña',
    });
    const toggleConfirm = screen.getByRole('button', {
      name: 'Ver confirmación de contraseña',
    });

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmInput).toHaveAttribute('type', 'password');

    fireEvent.click(togglePassword);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleConfirm);
    expect(confirmInput).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(
      screen.getByRole('button', { name: 'Ocultar confirmación de contraseña' })
    );
    expect(confirmInput).toHaveAttribute('type', 'password');
  });
});
