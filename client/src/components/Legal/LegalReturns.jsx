import React from 'react';
import { Link } from 'react-router-dom';
import LegalNav from './LegalNav';
import { useRepentanceModal } from '../../context/RepentanceModalContext';

function LegalReturns() {
  const { openRepentanceModal } = useRepentanceModal();

  return (
    <article className="legal-page">
      <header className="page-banner">
        <div className="container">
          <p className="section-eyebrow">Atención Posventa</p>
          <h1 className="section-title">Política de Cambios y Devoluciones</h1>
          <p className="section-intro">
            Condiciones claras, procedimientos de cambio y gestión ágil de
            revocaciones.
          </p>
        </div>
      </header>

      <section className="legal-content-section">
        <div className="container legal-layout">
          <LegalNav />

          <div className="legal-main">
            <div className="legal-card">
              <p className="legal-updated">
                Última actualización: Noviembre 2026
              </p>

              <div className="legal-block">
                <h2>1. Garantía de Satisfacción y Cambios</h2>
                <p>
                  Queremos que cada mueble que ingresa a tu hogar sea una pieza
                  entrañable. Si al recibir tu producto necesitás cambiar de
                  modelo, color o medidas por otra variante de nuestro catálogo,
                  disponés de <strong>30 días corridos</strong> desde la
                  recepción para solicitar el cambio.
                </p>
              </div>

              <div className="legal-block">
                <h2>2. Condiciones para Realizar un Cambio</h2>
                <ul>
                  <li>
                    El producto debe encontrarse sin uso, en el mismo estado en
                    que fue entregado.
                  </li>
                  <li>
                    Debe conservar el embalaje protector original y todos sus
                    herrajes/accesorios de ensamble.
                  </li>
                  <li>
                    Presentar la factura de compra o el número de orden
                    correspondiente.
                  </li>
                  <li>
                    Los productos a medida o con grabados/tapizados especiales
                    personalizados se rigen por las condiciones particulares
                    pactadas al encargar la pieza.
                  </li>
                </ul>
              </div>

              <div className="legal-block">
                <h2>3. Derecho de Arrepentimiento / Revocación Legal</h2>
                <p>
                  Conforme al{' '}
                  <strong>
                    Artículo 34 de la Ley 24.240 de Defensa del Consumidor
                  </strong>{' '}
                  y la{' '}
                  <strong>
                    Resolución 424/2020 de la Secretaría de Comercio Interior
                  </strong>
                  , para compras realizadas por medios electrónicos tenés
                  derecho a revocar la compra dentro de los{' '}
                  <strong>10 (diez) días corridos</strong> contados a partir de
                  la entrega del producto.
                </p>
                <div className="legal-callout">
                  <h3>¿Necesitás revocar tu compra?</h3>
                  <p>
                    No necesitás justificar el motivo ni asumir penalizaciones
                    económicas. Los gastos de retiro del producto corren por
                    cuenta de Hermanos Jota.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary legal-repentance-cta"
                    onClick={openRepentanceModal}
                  >
                    Abrir Formulario de Arrepentimiento
                  </button>
                </div>
              </div>

              <div className="legal-block">
                <h2>4. Reembolsos y Devolución del Dinero</h2>
                <p>
                  Una vez coordinado el retiro o recepción del mueble en nuestro
                  taller y verificada su integridad, se ordenará la devolución
                  total del dinero por el mismo medio de pago utilizado para la
                  compra. El reintegro se verá reflejado según los tiempos
                  habituales de acreditación de la entidad bancaria emisora
                  (generalmente entre 48 y 72 horas hábiles).
                </p>
              </div>

              <div className="legal-block">
                <h2>5. Daños por Transporte o Defectos</h2>
                <p>
                  Si al momento de recibir el producto notás un golpe o rotura
                  producida durante el traslado, por favor indicalo en el remito
                  del transportista y escribinos de inmediato a{' '}
                  <a href="mailto:posventa@hermanosjota.com.ar">
                    posventa@hermanosjota.com.ar
                  </a>{' '}
                  adjuntando fotos del embalaje y de la pieza para coordinar el
                  reemplazo inmediato sin cargo.
                </p>
              </div>

              <div className="legal-actions-footer">
                <Link to="/productos" className="btn btn-secondary">
                  Volver a la Tienda
                </Link>
                <Link to="/contacto" className="btn btn-primary">
                  Escribirnos a Posventa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

export default LegalReturns;
