import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Auth.css';

function RegisterPage({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const toastContext = useToast();
  const auth = useAuth();

  const passwordChecks = {
    min: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[^a-zA-Z0-9\s]/.test(formData.password),
  };

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errors.name = 'El nombre completo es requerido.';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es requerido.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Ingresá un correo electrónico válido.';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida.';
    } else if (!passwordChecks.min) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (!passwordChecks.upper) {
      errors.password =
        'La contraseña debe incluir al menos una letra mayúscula.';
    } else if (!passwordChecks.lower) {
      errors.password =
        'La contraseña debe incluir al menos una letra minúscula.';
    } else if (!passwordChecks.number) {
      errors.password = 'La contraseña debe incluir al menos un número.';
    } else if (!passwordChecks.special) {
      errors.password =
        'La contraseña debe incluir al menos un carácter especial (ej. !@#$%&*).';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setGeneralError('');

    try {
      const registeredUser = await auth.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (onRegisterSuccess) {
        onRegisterSuccess(registeredUser);
      }

      toastContext?.addToast?.(
        `¡Cuenta creada con éxito! Bienvenido, ${registeredUser?.name || formData.name.trim()}.`,
        'success'
      );

      navigate('/', { replace: true });
    } catch (err) {
      setGeneralError(
        err.message ||
          'No se pudo crear la cuenta. Por favor intentá nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <header className="auth-header">
          <span className="auth-badge">Registro de Clientes</span>
          <h1 className="auth-title">Crear Cuenta</h1>
          <p className="auth-subtitle">
            Unite a la comunidad de diseño de Mueblería Hermanos Jota
          </p>
        </header>

        {generalError && (
          <div
            className="auth-alert-error"
            role="alert"
            aria-live="assertive"
            id="register-error-alert"
          >
            {generalError}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label="Formulario de registro de usuario"
        >
          <div className="auth-field">
            <label className="auth-label" htmlFor="register-name">
              Nombre y apellido
            </label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              className={`auth-input ${fieldErrors.name ? 'has-error' : ''}`}
              placeholder="Ej. Martina Gómez"
              value={formData.name}
              onChange={handleChange}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={
                fieldErrors.name ? 'register-name-error' : undefined
              }
              disabled={isSubmitting}
            />
            {fieldErrors.name && (
              <span
                className="auth-error-msg"
                id="register-name-error"
                role="alert"
              >
                {fieldErrors.name}
              </span>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="register-email">
              Correo electrónico
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              className={`auth-input ${fieldErrors.email ? 'has-error' : ''}`}
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={
                fieldErrors.email ? 'register-email-error' : undefined
              }
              disabled={isSubmitting}
            />
            {fieldErrors.email && (
              <span
                className="auth-error-msg"
                id="register-email-error"
                role="alert"
              >
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="register-password">
              Contraseña (mínimo 8 caracteres)
            </label>
            <div className="auth-input-wrapper">
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`auth-input ${fieldErrors.password ? 'has-error' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? 'register-password-error' : undefined
                }
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Ver contraseña'
                }
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <span
                className="auth-error-msg"
                id="register-password-error"
                role="alert"
              >
                {fieldErrors.password}
              </span>
            )}

            <div className="auth-password-requirements">
              <span className="requirements-title">
                Requisitos de la contraseña:
              </span>
              <ul className="requirements-list">
                <li className={passwordChecks.min ? 'req-met' : 'req-pending'}>
                  <span className="req-icon" aria-hidden="true">
                    {passwordChecks.min ? '✓' : '•'}
                  </span>
                  Mínimo 8 caracteres
                </li>
                <li
                  className={passwordChecks.upper ? 'req-met' : 'req-pending'}
                >
                  <span className="req-icon" aria-hidden="true">
                    {passwordChecks.upper ? '✓' : '•'}
                  </span>
                  Al menos una letra mayúscula
                </li>
                <li
                  className={passwordChecks.lower ? 'req-met' : 'req-pending'}
                >
                  <span className="req-icon" aria-hidden="true">
                    {passwordChecks.lower ? '✓' : '•'}
                  </span>
                  Al menos una letra minúscula
                </li>
                <li
                  className={passwordChecks.number ? 'req-met' : 'req-pending'}
                >
                  <span className="req-icon" aria-hidden="true">
                    {passwordChecks.number ? '✓' : '•'}
                  </span>
                  Al menos un número
                </li>
                <li
                  className={passwordChecks.special ? 'req-met' : 'req-pending'}
                >
                  <span className="req-icon" aria-hidden="true">
                    {passwordChecks.special ? '✓' : '•'}
                  </span>
                  Al menos un carácter especial (ej. !@#$%)
                </li>
              </ul>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="register-confirm-password">
              Confirmar contraseña
            </label>
            <div className="auth-input-wrapper">
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`auth-input ${
                  fieldErrors.confirmPassword ? 'has-error' : ''
                }`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={
                  fieldErrors.confirmPassword
                    ? 'register-confirm-password-error'
                    : undefined
                }
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? 'Ocultar confirmación de contraseña'
                    : 'Ver confirmación de contraseña'
                }
                title={
                  showConfirmPassword
                    ? 'Ocultar confirmación de contraseña'
                    : 'Ver confirmación de contraseña'
                }
              >
                {showConfirmPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <span
                className="auth-error-msg"
                id="register-confirm-password-error"
                role="alert"
              >
                {fieldErrors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            id="register-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="auth-spinner" aria-hidden="true" />
                <span>Creando cuenta...</span>
              </>
            ) : (
              'Registrarme'
            )}
          </button>
        </form>

        <footer className="auth-footer">
          ¿Ya tenés una cuenta registrada?
          <Link to="/login" className="auth-link">
            Iniciar sesión
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default RegisterPage;
