import React, { useState, useEffect, useRef, useCallback } from 'react';

const REASON_OPTIONS = [
  { value: '', label: 'Seleccioná un motivo...' },
  { value: 'cambio_opinion', label: 'Cambié de opinión / Ya no lo necesito' },
  {
    value: 'producto_diferente',
    label: 'El producto no coincide con lo esperado',
  },
  { value: 'error_pedido', label: 'Error al realizar el pedido' },
  { value: 'demora_entrega', label: 'Demora en la entrega' },
  { value: 'otro', label: 'Otro motivo' },
];

function RepentanceModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    numeroOrden: '',
    motivo: '',
    comentarios: '',
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const modalRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);
  const firstInputRef = useRef(null);
  const successCloseBtnRef = useRef(null);

  // Guardar elemento enfocado al abrir y restaurar al cerrar
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement;
      // Prevenir scroll en el fondo mientras el modal está abierto
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Foco en el primer input accesible al abrir
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 50);

      return () => {
        document.body.style.overflow = originalOverflow;
        if (
          previouslyFocusedElementRef.current &&
          previouslyFocusedElementRef.current.focus
        ) {
          previouslyFocusedElementRef.current.focus();
        }
      };
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    onClose();
    // Resetear después de que se oculte
    setTimeout(() => {
      setSubmitted(false);
      setErrors({});
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        numeroOrden: '',
        motivo: '',
        comentarios: '',
      });
    }, 200);
  }, [onClose]);

  // Manejo de tecla Escape y trampa básica de tabulación
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  // Foco al confirmar el éxito
  useEffect(() => {
    if (submitted && successCloseBtnRef.current) {
      successCloseBtnRef.current.focus();
    }
  }, [submitted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Ingresá tu nombre y apellido.';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'Ingresá un teléfono de contacto.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Ingresá tu correo electrónico.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email =
        'Ingresá un formato de email válido (ej: nombre@correo.com).';
    }

    if (!formData.numeroOrden.trim()) {
      newErrors.numeroOrden = 'Ingresá el número de tu orden de compra.';
    }

    if (!formData.motivo) {
      newErrors.motivo = 'Por favor seleccioná una opción.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    // Simulación de envío exitoso conforme a la Ley de Defensa del Consumidor
    const generatedTicket = `ARR-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(generatedTicket);
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div
      className="repentance-modal-overlay"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="repentance-modal-card"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="repentance-modal-title"
        aria-describedby="repentance-modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="repentance-modal-close"
          onClick={handleClose}
          aria-label="Cerrar modal de arrepentimiento"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <header className="repentance-modal-header">
          <h2 id="repentance-modal-title" className="repentance-modal-title">
            Botón de arrepentimiento
          </h2>
          <p id="repentance-modal-desc" className="repentance-modal-intro">
            ¿Te arrepentiste de tu compra? Contactanos.
          </p>
        </header>

        {submitted ? (
          <div className="repentance-modal-success" role="alert">
            <div className="repentance-success-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="48"
                height="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 className="repentance-success-title">¡Solicitud recibida!</h3>
            <p className="repentance-success-text">
              Tu solicitud de revocación/arrepentimiento ha sido procesada con
              éxito. Nos pondremos en contacto con vos en las próximas 24 a 48
              horas hábiles para coordinar la devolución de tu pago y el retiro
              del producto.
            </p>
            <div className="repentance-ticket-box">
              <span className="repentance-ticket-label">
                Código de gestión:
              </span>
              <span className="repentance-ticket-code">{ticketId}</span>
            </div>
            <p className="repentance-success-sub">
              Guardá este código para hacer el seguimiento correspondiente de tu
              trámite.
            </p>
            <button
              type="button"
              ref={successCloseBtnRef}
              className="btn btn-primary repentance-btn-submit"
              onClick={handleClose}
            >
              Entendido y cerrar
            </button>
          </div>
        ) : (
          <form
            className="repentance-modal-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="repentance-form-group">
              <label htmlFor="repentance-nombre">
                Nombre y apellido <span className="repentance-required">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="text"
                id="repentance-nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez"
                aria-required="true"
                aria-invalid={!!errors.nombre}
                aria-describedby={
                  errors.nombre ? 'repentance-error-nombre' : undefined
                }
                className={errors.nombre ? 'input-error' : ''}
              />
              {errors.nombre && (
                <span
                  id="repentance-error-nombre"
                  className="repentance-error-msg"
                >
                  {errors.nombre}
                </span>
              )}
            </div>

            <div className="repentance-form-row">
              <div className="repentance-form-group">
                <label htmlFor="repentance-telefono">
                  Teléfono <span className="repentance-required">*</span>
                </label>
                <input
                  type="tel"
                  id="repentance-telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej. 11 2345-6789"
                  aria-required="true"
                  aria-invalid={!!errors.telefono}
                  aria-describedby={
                    errors.telefono ? 'repentance-error-telefono' : undefined
                  }
                  className={errors.telefono ? 'input-error' : ''}
                />
                {errors.telefono && (
                  <span
                    id="repentance-error-telefono"
                    className="repentance-error-msg"
                  >
                    {errors.telefono}
                  </span>
                )}
              </div>

              <div className="repentance-form-group">
                <label htmlFor="repentance-email">
                  Email <span className="repentance-required">*</span>
                </label>
                <input
                  type="email"
                  id="repentance-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={
                    errors.email ? 'repentance-error-email' : undefined
                  }
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && (
                  <span
                    id="repentance-error-email"
                    className="repentance-error-msg"
                  >
                    {errors.email}
                  </span>
                )}
              </div>
            </div>

            <div className="repentance-form-group">
              <label htmlFor="repentance-numeroOrden">
                Número de orden <span className="repentance-required">*</span>
              </label>
              <input
                type="text"
                id="repentance-numeroOrden"
                name="numeroOrden"
                value={formData.numeroOrden}
                onChange={handleChange}
                placeholder="Ej. ORD-12345"
                aria-required="true"
                aria-invalid={!!errors.numeroOrden}
                aria-describedby={
                  errors.numeroOrden
                    ? 'repentance-error-numeroOrden'
                    : undefined
                }
                className={errors.numeroOrden ? 'input-error' : ''}
              />
              {errors.numeroOrden && (
                <span
                  id="repentance-error-numeroOrden"
                  className="repentance-error-msg"
                >
                  {errors.numeroOrden}
                </span>
              )}
            </div>

            <div className="repentance-form-group">
              <label htmlFor="repentance-motivo">
                ¿Qué pasó con tu compra?{' '}
                <span className="repentance-required">*</span>
              </label>
              <select
                id="repentance-motivo"
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                aria-required="true"
                aria-invalid={!!errors.motivo}
                aria-describedby={
                  errors.motivo ? 'repentance-error-motivo' : undefined
                }
                className={errors.motivo ? 'input-error' : ''}
              >
                {REASON_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.value === ''}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.motivo && (
                <span
                  id="repentance-error-motivo"
                  className="repentance-error-msg"
                >
                  {errors.motivo}
                </span>
              )}
            </div>

            <div className="repentance-form-group">
              <label htmlFor="repentance-comentarios">
                Comentarios{' '}
                <span className="repentance-optional">(opcional)</span>
              </label>
              <textarea
                id="repentance-comentarios"
                name="comentarios"
                value={formData.comentarios}
                onChange={handleChange}
                rows="3"
                placeholder="Detallá cualquier observación o indicación extra..."
              ></textarea>
            </div>

            <div className="repentance-modal-actions">
              <button
                type="button"
                className="btn btn-secondary repentance-btn-cancel"
                onClick={handleClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary repentance-btn-submit"
              >
                Enviar solicitud
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RepentanceModal;
