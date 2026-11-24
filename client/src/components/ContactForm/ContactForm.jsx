import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

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
  const { addToast } = useToast();

  const [sending, setSending] = useState(false);

  const validateEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre.trim() || !email.trim() || !asunto.trim() || !mensaje.trim()) {
      addToast('Por favor completá todos los campos requeridos.', 'error');
      return;
    }

    if (!validateEmail(email)) {
      addToast('Ingresá un email válido para poder responderte.', 'error');
      return;
    }

    setSending(true);

    setTimeout(() => {
      addToast(
        `¡Gracias ${nombre.trim()}! Recibimos tu consulta. Te responderemos a la brevedad.`,
        'success'
      );
      setNombre('');
      setEmail('');
      setAsunto('');
      setMensaje('');
      setSending(false);
    }, 600);
  };

  return (
    <>
      {/* Banner superior editorial y coherente con el brand */}
      <section className="contact-hero-banner" aria-labelledby="contact-title">
        <div className="container">
          <span className="catalog-hero-eyebrow"></span>
          <h1 id="contact-title" className="contact-hero-title">
            Conversá con <span className="contact-hero-title">nosotros</span>
          </h1>
          <p className="contact-hero-subtitle">
            Cada proyecto comienza con una charla. Escribinos para consultas,
            presupuestos a medida o coordinar una visita a nuestro taller y
            showroom.
          </p>
        </div>
      </section>

      {/* Formulario e info */}
      <section className="contact-section" id="contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* Formulario */}
            <div className="contact-form-column">
              <div className="contact-card-box">
                <div className="contact-box-header">
                  <span className="contact-box-badge">MENSAJE DIRECTO</span>
                  <h2 className="contact-box-title">Envianos tu consulta</h2>
                  <p className="contact-box-desc">
                    Completá los datos y te contactaremos con una propuesta a
                    medida para tu espacio.
                  </p>
                </div>

                <form
                  className="contact-form"
                  id="contact-form"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="contact-name">Nombre completo *</label>
                      <input
                        type="text"
                        id="contact-name"
                        name="name"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej. Lucas Benítez"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact-email">
                        Correo electrónico *
                      </label>
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
                    <label htmlFor="contact-subject">
                      Motivo de contacto *
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={asunto}
                      onChange={(e) => setAsunto(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Elegí un motivo
                      </option>
                      <option value="consulta">
                        Consulta general sobre colecciones
                      </option>
                      <option value="producto">
                        Consulta sobre un mueble específico
                      </option>
                      <option value="presupuesto">
                        Solicitar presupuesto personalizado
                      </option>
                      <option value="restauracion">
                        Servicio de restauración (Herencia Viva)
                      </option>
                      <option value="visita">
                        Coordinar visita a taller / showroom
                      </option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-message">Mensaje *</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      placeholder="Contanos las medidas, el tipo de madera o la idea que tenés en mente…"
                      required
                    />
                  </div>

                  <div className="contact-form-footer">
                    <button
                      type="submit"
                      className="btn btn-primary btn-contact-submit"
                      id="contact-submit"
                      disabled={sending}
                    >
                      <span>
                        {sending ? 'Enviando mensaje...' : 'Enviar consulta'}
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </button>
                    <span className="contact-privacy-note">
                      🔒 Tus datos están protegidos y solo se usan para
                      responder tu consulta.
                    </span>
                  </div>
                </form>
              </div>
            </div>

            {/* Info de contacto y taller */}
            <div className="contact-info-column">
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
                  <div className="contact-info-content">
                    <span className="contact-card-eyebrow">
                      CASA TALLER & SHOWROOM
                    </span>
                    <h4>San Cristóbal, CABA</h4>
                    <address>
                      Av. San Juan 2847
                      <br />
                      C1232AAB · Buenos Aires, Argentina
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
                  <div className="contact-info-content">
                    <span className="contact-card-eyebrow">DISPONIBILIDAD</span>
                    <h4>Horarios de atención</h4>
                    <p>
                      <strong>Lunes a Viernes:</strong> 10:00 a 19:00 hs
                      <br />
                      <strong>Sábados:</strong> 10:00 a 14:00 hs
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
                  <div className="contact-info-content">
                    <span className="contact-card-eyebrow">CANAL EMAIL</span>
                    <h4>Correo electrónico</h4>
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
                  <div
                    className="card-icon card-icon--whatsapp"
                    aria-hidden="true"
                  >
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
                  <div className="contact-info-content">
                    <span className="contact-card-eyebrow">
                      ATENCIÓN INMEDIATA
                    </span>
                    <h4>WhatsApp Taller</h4>
                    <p>
                      <a
                        href="https://wa.me/541145678900"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-whatsapp-link"
                      >
                        +54 11 4567-8900
                        <span className="contact-link-arrow">→</span>
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Mapa de Ubicación */}
              <div className="contact-map-wrapper">
                <div className="contact-map-header">
                  <span className="contact-map-dot" aria-hidden="true"></span>
                  <span>Ubicación en San Cristóbal</span>
                </div>
                <div className="contact-map">
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
        </div>
      </section>
    </>
  );
}

export default ContactForm;
