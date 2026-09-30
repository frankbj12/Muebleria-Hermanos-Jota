import React, { useState } from 'react';

/**
 * Componente ContactForm
 * Formulario de contacto controlado con useState para cada campo y validación en cliente.
 * Incluye page-banner, grid de formulario + info de contacto con mapa, fiel al legacy.
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
  const [sending, setSending] = useState(false);

  const validateEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre.trim() || !email.trim() || !asunto.trim() || !mensaje.trim()) {
      setStatus({
        type: 'error',
        message: 'Por favor completá todos los campos requeridos.',
      });
      return;
    }

    if (!validateEmail(email)) {
      setStatus({
        type: 'error',
        message: 'Ingresá un email válido para poder responderte.',
      });
      return;
    }

    setSending(true);
    setStatus({ type: 'idle', message: '' });

    setTimeout(() => {
      setStatus({
        type: 'success',
        message: `¡Gracias ${nombre.trim()}! Recibimos tu consulta. Te responderemos a la brevedad.`,
      });
      setNombre('');
      setEmail('');
      setAsunto('');
      setMensaje('');
      setSending(false);
    }, 600);
  };

  return (
    <>
      {/* Banner superior */}
      <section className="page-banner">
        <div className="container">
          <h1 className="section-title">Contacto</h1>
          <p className="section-intro">
            Nos encanta conversar sobre muebles, diseño y materiales
          </p>
        </div>
      </section>

      {/* Formulario e info */}
      <section className="contact-section" id="contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* Formulario */}
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
                    <option value="restauracion">
                      Servicio de restauración
                    </option>
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
                  disabled={sending}
                >
                  {sending ? 'Enviando...' : 'Enviar mensaje'}
                </button>

                {status.message && (
                  <p
                    className={`form-feedback form-feedback-${status.type}`}
                    id="form-feedback"
                    role="status"
                    aria-live="polite"
                  >
                    {status.message}
                  </p>
                )}
              </form>
            </div>

            {/* Info de contacto */}
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
                    <h4>Showroom y Taller</h4>
                    <address>
                      Av. San Juan 2847
                      <br />
                      C1232AAB — Barrio de San Cristóbal
                      <br />
                      Argentina
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
                      Lunes a Viernes: 10:00 – 19:00
                      <br />
                      Sábados: 10:00 – 14:00
                    </p>
                  </div>
                </div>

                <div className="contact-info-card contact-info-card--action">
                  <div className="card-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div>
                    <h4>Escribinos</h4>
                    <p>
                      <a href="mailto:info@hermanosjota.com.ar">
                        info@hermanosjota.com.ar
                      </a>
                      <br />
                      <a href="mailto:ventas@hermanosjota.com.ar">
                        ventas@hermanosjota.com.ar
                      </a>
                    </p>
                  </div>
                </div>

                <div className="contact-info-card contact-info-card--action">
                  <div className="card-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <h4>WhatsApp</h4>
                    <p>
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

              {/* Mapa */}
              <div
                className="contact-map"
                style={{ marginTop: 'var(--space-lg)' }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.4!2d-58.4!3d-34.625!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM3JzMwLjAiUyA1OMKwMjQnMDAuMCJX!5e0!3m2!1ses!2sar!4v1"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Hermanos Jota en Google Maps"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ContactForm;
