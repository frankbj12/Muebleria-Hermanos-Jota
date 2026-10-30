import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';
import { getProductImageUrl } from '../../utils/imageUrl';
import {
  formatCurrency,
  processChatbotMessage,
  QUICK_ACTIONS,
} from './chatbotEngine';
import './Chatbot.css';

function getNowTimeString() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const INITIAL_MESSAGE = {
  id: 'welcome-msg',
  sender: 'bot',
  text: '¡Hola! Te damos la bienvenida a Hermanos Jota. Soy tu asistente virtual. ¿En qué podemos ayudarte hoy?',
  timestamp: getNowTimeString(),
  actions: QUICK_ACTIONS,
};

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const { products } = useProducts();
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll al final de los mensajes al recibir uno nuevo
  const scrollToBottom = useCallback(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen, scrollToBottom]);

  // Enfocar el input al abrir el chat
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Cerrar chat con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Maneja el envío de mensaje del usuario o la selección de una opción
  const handleSendMessage = useCallback(
    (textToSend, displayText = null) => {
      const trimmed = textToSend.trim();
      if (!trimmed || isTyping) return;

      const userMsg = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: displayText || trimmed,
        timestamp: getNowTimeString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      setIsTyping(true);

      // Simular tiempo de respuesta breve para naturalidad
      setTimeout(() => {
        const botResponse = processChatbotMessage(trimmed, products);
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botResponse.text,
          timestamp: getNowTimeString(),
          products: botResponse.products,
          actions: botResponse.actions,
          whatsappLink: botResponse.whatsappLink,
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 420);
    },
    [isTyping, products]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleActionClick = (action) => {
    if (action.isLink) {
      navigate(action.isLink);
      return;
    }
    handleSendMessage(action.id, action.label);
  };

  const handleResetChat = () => {
    setMessages([
      {
        ...INITIAL_MESSAGE,
        id: `welcome-${Date.now()}`,
        timestamp: getNowTimeString(),
      },
    ]);
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <aside aria-label="Asistente de atención al cliente">
      {/* Botón flotante para abrir/cerrar */}
      <button
        type="button"
        className="hj-chatbot-fab"
        onClick={toggleChat}
        aria-expanded={isOpen}
        aria-controls="hj-chatbot-window"
        aria-label={
          isOpen
            ? 'Cerrar asistente de atención al cliente'
            : 'Abrir asistente de atención al cliente'
        }
      >
        {isOpen ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {hasUnread && <span className="hj-chatbot-fab-badge" />}
          </>
        )}
      </button>

      {/* Ventana de chat desplegable */}
      {isOpen && (
        <section
          id="hj-chatbot-window"
          className="hj-chatbot-window"
          role="dialog"
          aria-labelledby="hj-chatbot-header-title"
          aria-modal="false"
        >
          {/* Cabecera */}
          <header className="hj-chatbot-header">
            <div className="hj-chatbot-header-info">
              <div className="hj-chatbot-avatar">
                <img
                  src="/assets/logo.svg"
                  alt="Logo Hermanos Jota"
                  className="hj-chatbot-logo-img"
                  width="24"
                  height="24"
                />
              </div>
              <div>
                <h3 id="hj-chatbot-header-title" className="hj-chatbot-title">
                  Hermanos Jota
                </h3>
                <div className="hj-chatbot-status">
                  <span className="hj-chatbot-status-dot" aria-hidden="true" />
                  <span>En línea · Asesor Virtual</span>
                </div>
              </div>
            </div>

            <div className="hj-chatbot-header-actions">
              <button
                type="button"
                className="hj-chatbot-icon-btn"
                onClick={handleResetChat}
                title="Reiniciar conversación"
                aria-label="Reiniciar conversación"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>
              <button
                type="button"
                className="hj-chatbot-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Cerrar chat"
                aria-label="Cerrar chat"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </header>

          {/* Historial de mensajes */}
          <div
            className="hj-chatbot-messages"
            tabIndex={0}
            role="log"
            aria-live="polite"
          >
            {messages.map((msg) => (
              <div key={msg.id} className={`hj-chat-msg ${msg.sender}`}>
                <div className="hj-chat-msg-bubble">
                  {msg.text.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>
                      {paragraph.split('\n').map((line, lineIdx) => {
                        // Resaltar **negrita**
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <React.Fragment key={lineIdx}>
                            {lineIdx > 0 && <br />}
                            {parts.map((part, partIdx) => {
                              if (
                                part.startsWith('**') &&
                                part.endsWith('**')
                              ) {
                                return (
                                  <strong key={partIdx}>
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return part;
                            })}
                          </React.Fragment>
                        );
                      })}
                    </p>
                  ))}

                  {/* Tarjetas de productos devueltas por búsqueda en catálogo */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="hj-chatbot-products">
                      {msg.products.map((item) => {
                        const itemId = item.id || item._id;
                        const price = item.price ?? item.precio;
                        const stock = item.stock ?? 0;
                        const hasStock = stock > 0;

                        return (
                          <Link
                            key={itemId}
                            to={`/productos/${itemId}`}
                            className="hj-chat-product-card"
                            onClick={() => {
                              if (window.innerWidth <= 480) {
                                setIsOpen(false);
                              }
                            }}
                          >
                            <img
                              src={getProductImageUrl(
                                item.image || item.imagenUrl
                              )}
                              alt={item.name || item.nombre}
                              className="hj-chat-product-img"
                              loading="lazy"
                            />
                            <div className="hj-chat-product-details">
                              <div className="hj-chat-product-title">
                                {item.name || item.nombre}
                              </div>
                              <div className="hj-chat-product-meta">
                                <span className="hj-chat-product-price">
                                  {formatCurrency(price)}
                                </span>
                                <span
                                  className={`hj-chat-product-stock ${
                                    hasStock ? 'in-stock' : 'out-of-stock'
                                  }`}
                                >
                                  {hasStock ? 'En stock' : 'A pedido'}
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Botón de acceso directo a WhatsApp si la respuesta lo incluye */}
                  {msg.whatsappLink && (
                    <a
                      href={msg.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hj-chatbot-wa-cta"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span>Hablar con un asesor por WhatsApp</span>
                    </a>
                  )}
                </div>
                <span className="hj-chat-msg-time">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div
                className="hj-chatbot-typing"
                aria-label="El asistente está escribiendo..."
              >
                <span className="hj-typing-dot" />
                <span className="hj-typing-dot" />
                <span className="hj-typing-dot" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Opciones rápidas (acciones sugeridas del último mensaje de bot) */}
          {(() => {
            const lastBotMsg = [...messages]
              .reverse()
              .find((m) => m.sender === 'bot');
            const actions = lastBotMsg?.actions || QUICK_ACTIONS;

            return (
              <div className="hj-chatbot-chips">
                {actions.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    className="hj-chat-chip-btn"
                    onClick={() => handleActionClick(act)}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Formulario de entrada de texto */}
          <form className="hj-chatbot-input-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="hj-chatbot-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribí tu consulta aquí..."
              aria-label="Mensaje para el asistente"
              disabled={isTyping}
            />
            <button
              type="submit"
              className="hj-chatbot-send-btn"
              disabled={!inputValue.trim() || isTyping}
              aria-label="Enviar mensaje"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </section>
      )}
    </aside>
  );
}

export default Chatbot;
