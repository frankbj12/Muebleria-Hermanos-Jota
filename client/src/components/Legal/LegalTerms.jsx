import React from 'react';
import { Link } from 'react-router-dom';
import LegalNav from './LegalNav';

function LegalTerms() {
  return (
    <article className="legal-page">
      <header className="page-banner">
        <div className="container">
          <p className="section-eyebrow">Marco Regulatorio</p>
          <h1 className="section-title">Términos y Condiciones</h1>
          <p className="section-intro">
            Condiciones de contratación, uso del sitio y derechos del
            consumidor.
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
                <h2>1. Identificación del Titular</h2>
                <p>
                  El presente sitio web es operado por{' '}
                  <strong>Mueblería Hermanos Jota</strong>, con taller y
                  showroom central en Av. San Juan 2847, Barrio de San
                  Cristóbal, Ciudad Autónoma de Buenos Aires, República
                  Argentina. Contacto:{' '}
                  <a href="mailto:info@hermanosjota.com.ar">
                    info@hermanosjota.com.ar
                  </a>{' '}
                  | Tel / WhatsApp: +54 11 4567-8900.
                </p>
              </div>

              <div className="legal-block">
                <h2>2. Ámbito de Aplicación y Marco Legal</h2>
                <p>
                  Todas las compras y contrataciones realizadas a través de este
                  sitio están regidas por las leyes vigentes en la República
                  Argentina, incluyendo la Ley de Defensa del Consumidor N°
                  24.240, el Código Civil y Comercial de la Nación, y las
                  resoluciones emitidas por la Secretaría de Comercio Interior y
                  la Dirección Nacional de Defensa del Consumidor.
                </p>
              </div>

              <div className="legal-block">
                <h2>3. Precios, Pagos y Facturación</h2>
                <p>
                  Los precios indicados en el sitio se expresan en pesos
                  argentinos (ARS) e incluyen el Impuesto al Valor Agregado
                  (IVA). Emitimos facturas electrónicas Tipo A o Tipo B según la
                  condición fiscal informada por el comprador al momento de la
                  compra. Las promociones, descuentos o financiación en cuotas
                  tienen vigencia limitada y están sujetas a los términos
                  explícitos de cada entidad bancaria o procesador de pagos.
                </p>
              </div>

              <div className="legal-block">
                <h2>4. Envíos y Plazos de Entrega</h2>
                <p>
                  Dada la naturaleza artesanal de nuestras piezas de mobiliario,
                  los plazos de entrega oscilan entre 5 y 15 días hábiles
                  dependiendo del stock y la zona geográfica. Coordinamos
                  entregas directas en CABA y GBA, y despachos al interior del
                  país a través de empresas de transporte especializadas en
                  cargas frágiles.
                </p>
              </div>

              <div className="legal-block">
                <h2>5. Garantía Legal de Fabricación</h2>
                <p>
                  Todos nuestros productos cuentan con una garantía legal mínima
                  de seis (6) meses por defectos de fabricación y ensamblado,
                  conforme al artículo 11 de la Ley 24.240. Las maderas macizas
                  nobles (Lapacho, Cedro, Roble, Petiribí) presentan vetas y
                  variaciones naturales propias del material vivo que no
                  constituyen defectos ni vicios ocultos.
                </p>
              </div>

              <div className="legal-block">
                <h2>6. Derecho de Revocación / Arrepentimiento</h2>
                <p>
                  De acuerdo con el artículo 34 de la Ley 24.240 y la Resolución
                  424/2020 de la Secretaría de Comercio Interior, el consumidor
                  tiene derecho a revocar la aceptación de la compra dentro del
                  plazo de 10 (diez) días corridos contados a partir de la fecha
                  de entrega del producto o de la celebración del contrato.
                  Podés ejercer este derecho de forma inmediata utilizando
                  nuestro <strong>Botón de arrepentimiento</strong> disponible
                  en el pie de página de este sitio.
                </p>
              </div>

              <div className="legal-actions-footer">
                <Link to="/productos" className="btn btn-secondary">
                  Ver Catálogo de Muebles
                </Link>
                <Link to="/contacto" className="btn btn-primary">
                  Canal de Contacto y Dudas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

export default LegalTerms;
