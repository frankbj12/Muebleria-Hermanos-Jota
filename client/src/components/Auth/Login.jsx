import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requestedLocation = location.state?.from;
  const fallbackPath = '/';
  const destination =
    requestedLocation &&
    typeof requestedLocation.pathname === 'string' &&
    requestedLocation.pathname !== '/login'
      ? `${requestedLocation.pathname}${requestedLocation.search || ''}${requestedLocation.hash || ''}`
      : fallbackPath;

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [destination, isAuthenticated, loading, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(credentials);
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="auth-card__eyebrow">Acceso privado</p>
        <h1 className="auth-card__title">Iniciar sesión</h1>
        <p className="auth-card__copy">
          Ingresá tus datos para continuar a la sección solicitada.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            Email
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-field">
            Contraseña
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <Link to="/">Volver al inicio</Link>
      </div>
    </section>
  );
}
