import React, { useState, useEffect, useRef } from 'react';

/**
 * Modal de confirmación de eliminación estilo GitHub.
 * Exige escribir una palabra clave (por defecto "confirmar") para habilitar el botón de acción destructiva.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Indica si el modal está visible
 * @param {Function} props.onClose - Callback al cancelar o cerrar el modal
 * @param {Function} props.onConfirm - Callback al confirmar la eliminación
 * @param {string} props.title - Título principal del modal
 * @param {string} [props.itemName] - Nombre del elemento a eliminar (producto, imagen, etc.)
 * @param {string} [props.itemType] - Tipo de elemento ("producto", "imagen", etc.)
 * @param {string} [props.confirmKeyword="confirmar"] - Palabra requerida para habilitar la eliminación
 * @param {string} [props.warningMessage] - Mensaje adicional de advertencia
 * @param {boolean} [props.isDeleting=false] - Estado de carga mientras se ejecuta la acción
 */
export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Confirmar eliminación?',
  itemName = '',
  itemType = 'elemento',
  confirmKeyword = 'confirmar',
  warningMessage = '',
  isDeleting = false,
}) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Reiniciar el input cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      // Bloquear scroll de fondo
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Manejo de tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  const isMatch =
    inputValue.trim().toLowerCase() === confirmKeyword.trim().toLowerCase();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isMatch && !isDeleting) {
      onConfirm();
    }
  };

  return (
    <div
      className="admin-modal-overlay"
      onClick={!isDeleting ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="admin-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="admin-modal-header">
          <div className="admin-modal-header-icon" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="admin-modal-header-text">
            <h2 id="confirm-modal-title" className="admin-modal-title">
              {title}
            </h2>
            <p className="admin-modal-subtitle">
              Esta acción no se puede deshacer de forma automática.
            </p>
          </div>
          <button
            type="button"
            className="admin-modal-close-btn"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Cerrar ventana"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo */}
        <form onSubmit={handleSubmit} className="admin-modal-body">
          <div className="admin-modal-warning-box">
            <p>
              Estás a punto de eliminar permanentemente {itemType === 'imagen' ? 'la imagen' : 'el producto'}:
            </p>
            <p className="admin-modal-item-highlight">
              {itemName || `este ${itemType}`}
            </p>
            {warningMessage && (
              <p className="admin-modal-warning-extra">{warningMessage}</p>
            )}
          </div>

          <div className="admin-modal-field">
            <label htmlFor="confirm-input" className="admin-modal-label">
              Para confirmar, escribí{' '}
              <strong className="admin-modal-keyword">"{confirmKeyword}"</strong>{' '}
              a continuación:
            </label>
            <input
              id="confirm-input"
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Escribí "${confirmKeyword}"`}
              className="admin-modal-input"
              disabled={isDeleting}
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          {/* Acciones */}
          <div className="admin-modal-actions">
            <button
              type="button"
              className="btn btn-secondary admin-modal-btn-cancel"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn admin-modal-btn-delete"
              disabled={!isMatch || isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="admin-spinner" aria-hidden="true" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Entiendo las consecuencias, eliminar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
