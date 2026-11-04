import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const from = location.state?.from;
  const destination =
    from?.pathname && from.pathname !== '/login'
      ? `${from.pathname}${from.search || ''}${from.hash || ''}`
      : '/';

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [destination, isAuthenticated, loading, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login(credentials);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo iniciar sesión.');
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Iniciar sesión</h1>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={(event) =>
              setCredentials((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={(event) =>
              setCredentials((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            required
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit">Ingresar</button>
      </form>
    </main>
  );
}
