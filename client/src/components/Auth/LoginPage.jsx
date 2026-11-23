import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Auth.css';

function LoginPage({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const toastContext = useToast();
  const auth = useAuth();

  const from = location.state?.from;
  const destination =
    from?.pathname && from.pathname !== '/login'
      ? `${from.pathname}${from.search || ''}${from.hash || ''}`
      : '/';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showForgotModal) {
        handleCloseForgotModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForgotModal]);

  const handleOpenForgotModal = () => {
    setRecoveryEmail(formData.email.trim());
    setRecoveryError('');
    setRecoverySent(false);
    setShowForgotModal(true);
  };

  const handleCloseForgotModal = () => {
    setShowForgotModal(false);
    setRecoveryError('');
    setRecoverySent(false);
  };

  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!recoveryEmail.trim()) {
      setRecoveryError('Ingresá tu correo electrónico.');
      return;
    }
    if (!emailRegex.test(recoveryEmail.trim())) {
      setRecoveryError('Ingresá un correo electrónico válido.');
      return;
    }

    setRecoverySent(true);
    toastContext?.addToast?.(
      `Si existe una cuenta asociada a ${recoveryEmail.trim()}, recibirás las instrucciones en tu casilla.`,
      'info'
    );
  };

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es requerido.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Ingresá un correo electrónico válido.';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida.';
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
      const loggedUser = await auth.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (onLoginSuccess) {
        onLoginSuccess(loggedUser);
      }

      toastContext?.addToast?.(
        `¡Bienvenido de nuevo, ${loggedUser?.name || 'cliente'}!`,
        'success'
      );

      navigate(destination, { replace: true });
    } catch (err) {
      setGeneralError(
        err.message || 'No se pudo iniciar sesión. Verificá tus credenciales.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <header className="auth-header">
          <span className="auth-badge">Acceso de Clientes</span>
          <h1 className="auth-title">Iniciar Sesión</h1>
          <p className="auth-subtitle">
            Ingresá a tu cuenta en Mueblería Hermanos Jota
          </p>
        </header>

        {generalError && (
          <div
            className="auth-alert-error"
            role="alert"
            aria-live="assertive"
            id="login-error-alert"
          >
            <div className="auth-alert-content">
              <span>{generalError}</span>
              <button
                type="button"
                className="auth-alert-forgot-btn"
                onClick={handleOpenForgotModal}
              >
                ¿Olvidaste tu contraseña? Recuperala acá
              </button>
            </div>
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label="Formulario de inicio de sesión"
        >
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">
              Correo electrónico
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              className={`auth-input ${fieldErrors.email ? 'has-error' : ''}`}
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={
                fieldErrors.email ? 'login-email-error' : undefined
              }
              disabled={isSubmitting}
            />
            {fieldErrors.email && (
              <span
                className="auth-error-msg"
                id="login-email-error"
                role="alert"
              >
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="auth-field">
            <div className="auth-field-header">
              <label className="auth-label" htmlFor="login-password">
                Contraseña
              </label>
              <button
                type="button"
                className="auth-link-forgot"
                onClick={handleOpenForgotModal}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="auth-input-wrapper">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`auth-input ${fieldErrors.password ? 'has-error' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? 'login-password-error' : undefined
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
                id="login-password-error"
                role="alert"
              >
                {fieldErrors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            id="login-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="auth-spinner" aria-hidden="true" />
                <span>Ingresando...</span>
              </>
            ) : (
              'Ingresar a mi cuenta'
            )}
          </button>
        </form>

        <footer className="auth-footer">
          ¿Aún no tenés una cuenta?
          <Link to="/registro" className="auth-link">
            Crear cuenta
          </Link>
        </footer>
      </div>

      {showForgotModal && (
        <div
          className="auth-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-modal-title"
          onClick={handleCloseForgotModal}
        >
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="auth-modal-close"
              onClick={handleCloseForgotModal}
              aria-label="Cerrar ventana"
            >
              &times;
            </button>
            <h2 id="forgot-modal-title" className="auth-modal-title">
              Recuperar contraseña
            </h2>
            {recoverySent ? (
              <div className="auth-recovery-success">
                <span className="auth-recovery-icon" aria-hidden="true">
                  ✓
                </span>
                <p>
                  Si la dirección <strong>{recoveryEmail}</strong> está
                  registrada, recibirás un enlace para restablecer tu contraseña
                  en los próximos minutos.
                </p>
                <button
                  type="button"
                  className="btn btn-primary auth-submit-btn"
                  onClick={handleCloseForgotModal}
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecoverySubmit} noValidate>
                <p className="auth-modal-desc">
                  Ingresá el correo electrónico con el que te registraste y te
                  enviaremos los pasos para crear una nueva clave.
                </p>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="recovery-email">
                    Correo electrónico
                  </label>
                  <input
                    id="recovery-email"
                    type="email"
                    className={`auth-input ${recoveryError ? 'has-error' : ''}`}
                    placeholder="tu@email.com"
                    value={recoveryEmail}
                    onChange={(e) => {
                      setRecoveryEmail(e.target.value);
                      if (recoveryError) setRecoveryError('');
                    }}
                    autoFocus
                  />
                  {recoveryError && (
                    <span className="auth-error-msg" role="alert">
                      {recoveryError}
                    </span>
                  )}
                </div>
                <div className="auth-modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseForgotModal}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Enviar instrucciones
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default LoginPage;
