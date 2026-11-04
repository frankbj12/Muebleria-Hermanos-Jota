import React from 'react';
import { Link } from 'react-router-dom';
import LegalNav from './LegalNav';

function LegalPrivacy() {
  return (
    <article className="legal-page">
      <header className="page-banner">
        <div className="container">
          <p className="section-eyebrow">Protección de Datos</p>
          <h1 className="section-title">Política de Privacidad</h1>
          <p className="section-intro">
            Tratamiento seguro, confidencial y responsable de tu información
            personal.
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
                <h2>1. Compromiso con la Privacidad</h2>
                <p>
                  En <strong>Hermanos Jota</strong> respetamos y protegemos la
                  privacidad de quienes visitan nuestra tienda y confían en
                  nuestras creaciones. El tratamiento de los datos personales se
                  realiza bajo estricto cumplimiento de la{' '}
                  <strong>
                    Ley de Protección de Datos Personales N° 25.326
                  </strong>{' '}
                  y sus normas complementarias vigentes en la República
                  Argentina.
                </p>
              </div>

              <div className="legal-block">
                <h2>2. Información que Recopilamos</h2>
                <p>
                  Recopilamos únicamente los datos necesarios para procesar tus
                  compras, emitir la facturación fiscal correspondiente y
                  coordinar la logística de entrega:
                </p>
                <ul>
                  <li>Nombre y apellido o razón social.</li>
                  <li>Documento de identidad (DNI/CUIT/CUIL).</li>
                  <li>Dirección de entrega y código postal.</li>
                  <li>Correo electrónico y número telefónico de contacto.</li>
                </ul>
                <p>
                  Los datos de pago con tarjeta de crédito o débito son
                  procesados directamente por pasarelas de pago seguras con
                  certificación PCI-DSS; en ningún caso almacenamos números de
                  tarjeta ni códigos de seguridad en nuestros servidores.
                </p>
              </div>

              <div className="legal-block">
                <h2>3. Finalidad del Tratamiento</h2>
                <p>
                  La información facilitada se utiliza con el exclusivo fin de:
                </p>
                <ul>
                  <li>Gestionar pedidos, cobranzas y envíos de mobiliario.</li>
                  <li>
                    Comunicar el estado de preparación y despacho de las
                    órdenes.
                  </li>
                  <li>
                    Atender solicitudes posventa, garantías o consultas al
                    taller.
                  </li>
                  <li>
                    Tramitar revocaciones solicitadas mediante el botón de
                    arrepentimiento.
                  </li>
                </ul>
              </div>

              <div className="legal-block">
                <h2>4. Derechos de Acceso, Rectificación y Supresión</h2>
                <p>
                  El titular de los datos personales tiene la facultad de
                  ejercer el derecho de acceso a los mismos en forma gratuita a
                  intervalos no inferiores a seis meses, salvo que se acredite
                  un interés legítimo al efecto conforme lo establecido en el
                  artículo 14, inciso 3 de la Ley Nº 25.326.
                </p>
                <p>
                  Asimismo, podrá solicitar en cualquier momento la
                  actualización, rectificación o supresión de sus datos enviando
                  una comunicación formal a{' '}
                  <a href="mailto:privacidad@hermanosjota.com.ar">
                    privacidad@hermanosjota.com.ar
                  </a>
                  .
                </p>
                <p className="legal-highlight">
                  La Agencia de Acceso a la Información Pública, en su carácter
                  de Órgano de Control de la Ley N° 25.326, tiene la atribución
                  de atender las denuncias y reclamos que interpongan quienes
                  resulten afectados en sus derechos por incumplimiento de las
                  normas vigentes en materia de protección de datos personales.
                </p>
              </div>

              <div className="legal-actions-footer">
                <Link to="/productos" className="btn btn-secondary">
                  Explorar Colección
                </Link>
                <Link to="/contacto" className="btn btn-primary">
                  Contactar a Nuestro Equipo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

export default LegalPrivacy;
