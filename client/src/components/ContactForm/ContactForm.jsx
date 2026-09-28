import React, { useState } from 'react';

/**
 * Componente ContactForm
 * Formulario de contacto controlado con useState para cada campo y validación en cliente.
 * Incluye campos: nombre, email, asunto y mensaje, con feedback de estado y diseño fiel al brand.md.
 */
function ContactForm() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [status, setStatus] = useState({
    type: 'idle', // 'idle' | 'success' | 'error'
    message: '',
  });

  const validateEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación básica de campos requeridos
    if (!nombre.trim() || !email.trim() || !asunto.trim() || !mensaje.trim()) {
      setStatus({
        type: 'error',
        message: 'Por favor completá todos los campos requeridos.',
      });
      return;
    }

    // Validación de formato de email
    if (!validateEmail(email)) {
      setStatus({
        type: 'error',
        message: 'Ingresá un email válido para poder responderte.',
      });
      return;
    }

    // Simulación de envío exitoso
    setStatus({
      type: 'success',
      message: `¡Gracias ${nombre.trim()}! Recibimos tu consulta. Te responderemos a la brevedad.`,
    });

    // Resetear formulario
    setNombre('');
    setEmail('');
    setAsunto('');
    setMensaje('');
  };

  return (
    <section
      className="contact-section"
      id="contact-section"
      aria-label="Sección de contacto"
    >
      <div className="container">
        <header
          style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}
        >
          <h2 className="section-title">Contacto</h2>
          <p className="section-intro">
            Nos encanta conversar sobre muebles, diseño y materiales
          </p>
        </header>

        <div className="contact-grid">
          <div>
            <form
              className="contact-form"
              id="contact-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contact-name">Nombre</label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-email">Email</label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">Asunto</label>
                <select
                  id="contact-subject"
                  name="subject"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Elegí un tema
                  </option>
                  <option value="consulta">Consulta general</option>
                  <option value="producto">Consulta sobre un producto</option>
                  <option value="presupuesto">Solicitar presupuesto</option>
                  <option value="restauracion">Servicio de restauración</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">Mensaje</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Contanos en qué podemos ayudarte…"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                id="contact-submit"
              >
                Enviar mensaje
              </button>

              {status.message && (
                <p
                  className={`form-feedback form-feedback-${status.type}`}
                  id="form-feedback"
                  role="status"
                  aria-live="polite"
                  style={{ marginTop: 'var(--space-sm)' }}
                >
                  {status.message}
                </p>
              )}
            </form>
          </div>

          {/* Tarjetas de contacto con iconografía y clases exactas del diseño legacy */}
          <div>
            <div className="contact-info-cards">
              <div className="contact-info-card">
                <div className="card-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h4>Showroom & Taller</h4>
                  <address>
                    Av. San Juan 2847
                    <br />
                    C1232AAB — Barrio de San Cristóbal
                    <br />
                    Buenos Aires, Argentina
                  </address>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="card-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h4>Horarios</h4>
                  <p>
                    Lunes a Viernes: 10:00 a 19:00 hs
                    <br />
                    Sábados: 10:00 a 14:00 hs
                  </p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="card-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <h4>Canales directos</h4>
                  <p>
                    Email:{' '}
                    <a href="mailto:info@hermanosjota.com.ar">
                      info@hermanosjota.com.ar
                    </a>
                    <br />
                    WhatsApp:{' '}
                    <a
                      href="https://wa.me/541145678900"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      +54 11 4567-8900
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;
