/**
 * Motor de respuestas del Asistente Virtual de Hermanos Jota
 */

const WHATSAPP_URL =
  'https://wa.me/541145678900?text=Hola!%20Vengo%20desde%20la%20web%20de%20Hermanos%20Jota%20y%20quisiera%20hacerles%20una%20consulta.';

/**
 * Preguntas frecuentes y acciones rápidas iniciales
 */
export const QUICK_ACTIONS = [
  { id: 'catalogo', label: '🛋️ Ver catálogo y buscar muebles' },
  { id: 'horarios', label: '📍 Showroom y horarios' },
  { id: 'envios', label: '🚚 Envíos y entregas' },
  { id: 'materiales', label: '🌿 Materiales sustentables' },
  { id: 'garantia', label: '🛡️ Garantía "Herencia Viva"' },
  { id: 'whatsapp', label: '💬 Hablar con un asesor' },
];

/**
 * Normaliza un texto para búsqueda (minúsculas, sin tildes ni caracteres extraños)
 */
export function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Formatea un número como precio en pesos argentinos
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Busca productos en el catálogo disponible según términos de búsqueda o categoría
 */
export function searchProducts(query, products = []) {
  if (!Array.isArray(products) || products.length === 0) return [];

  const normalizedQuery = normalizeText(query);
  const words = normalizedQuery.split(/\s+/).filter((w) => w.length > 2);

  if (words.length === 0) {
    return products.slice(0, 4);
  }

  // Mapeo de sinónimos o categorías
  const categoryAliases = {
    living: 'living',
    comedor: 'comedor',
    dormitorio: 'dormitorio',
    habitacion: 'dormitorio',
    cuarto: 'dormitorio',
    oficina: 'oficina',
    escritorio: 'oficina',
    trabajo: 'oficina',
    almacenamiento: 'almacenamiento',
    guardado: 'almacenamiento',
  };

  const matches = products.filter((product) => {
    const prodName = normalizeText(product.name || product.nombre || '');
    const prodDesc = normalizeText(
      product.description || product.descripcion || ''
    );
    const prodCat = normalizeText(product.category || product.categoria || '');
    const specsStr = normalizeText(
      JSON.stringify(product.specs || product.detalles || '')
    );

    return words.some((word) => {
      // Coincidencia con alias de categoría
      if (categoryAliases[word] && prodCat.includes(categoryAliases[word])) {
        return true;
      }
      return (
        prodName.includes(word) ||
        prodCat.includes(word) ||
        prodDesc.includes(word) ||
        specsStr.includes(word)
      );
    });
  });

  return matches.slice(0, 4);
}

/**
 * Procesa un mensaje del usuario y devuelve la respuesta correspondiente
 *
 * @param {string} userText Mensaje escrito por el usuario o id de acción rápida
 * @param {Array} catalog Lista actual de productos cargada desde el backend/contexto
 * @returns {Object} { text: string, products?: Array, actions?: Array, whatsappLink?: string }
 */
export function processChatbotMessage(userText, catalog = []) {
  const normalized = normalizeText(userText);

  // 1. WhatsApp / Asesor Humano directo
  if (
    normalized === 'whatsapp' ||
    normalized.includes('whatsapp') ||
    normalized.includes('asesor') ||
    normalized.includes('humano') ||
    normalized.includes('persona') ||
    normalized.includes('telefono') ||
    normalized.includes('llamar') ||
    normalized.includes('vendedor')
  ) {
    return {
      text: 'Con gusto te contactamos con nuestro equipo de atención personalizada. Podés escribirnos directamente a nuestro WhatsApp oficial (+54 11 4567-8900) o hacer clic en el botón de abajo.',
      whatsappLink: WHATSAPP_URL,
      actions: [
        { id: 'catalogo', label: '🛋️ Explorar catálogo' },
        { id: 'horarios', label: '📍 Ver horarios del showroom' },
      ],
    };
  }

  // 2. Horarios y Showroom
  if (
    normalized === 'horarios' ||
    normalized.includes('horario') ||
    normalized.includes('donde estan') ||
    normalized.includes('donde queda') ||
    normalized.includes('ubicacion') ||
    normalized.includes('direccion') ||
    normalized.includes('showroom') ||
    normalized.includes('local') ||
    normalized.includes('visitar') ||
    normalized.includes('san cristobal') ||
    normalized.includes('san juan')
  ) {
    return {
      text: '¡Te esperamos en nuestra Casa Taller!\n\n📍 **Dirección:** Av. San Juan 2847, San Cristóbal, CABA.\n🕒 **Horarios:**\n• Lunes a Viernes: 10:00 a 19:00 hs.\n• Sábados: 10:00 a 14:00 hs.\n\nPodés acercarte a conocer los materiales nobles, probar las piezas y conversar directamente con nuestros ebanistas.',
      actions: [
        { id: 'catalogo', label: '🛋️ Ver catálogo online' },
        { id: 'whatsapp', label: '💬 Consultar por WhatsApp' },
      ],
    };
  }

  // 3. Envíos y Entregas
  if (
    normalized === 'envios' ||
    normalized.includes('envio') ||
    normalized.includes('entrega') ||
    normalized.includes('flete') ||
    normalized.includes('despacho') ||
    normalized.includes('costo de envio') ||
    normalized.includes('tiempo de entrega') ||
    normalized.includes('plazo')
  ) {
    return {
      text: 'Realizamos **envíos a todo el país** con fletes especializados y personal capacitado en el traslado de mobiliario artesanal.\n\n📦 **Embalaje sustentable:** Utilizamos protección 100% libre de plásticos de un solo uso.\n⏱️ **Tiempos de entrega:** Piezas en stock se entregan entre 3 y 7 días hábiles. Encargos a medida tienen un tiempo estimado de 15 a 25 días.\n\nPara cotizar el flete exacto hasta tu domicilio, podés escribirnos por WhatsApp.',
      whatsappLink: WHATSAPP_URL,
      actions: [
        { id: 'catalogo', label: '🛋️ Ver muebles disponibles' },
        { id: 'garantia', label: '🛡️ Conocer la garantía' },
      ],
    };
  }

  // 4. Materiales y Sustentabilidad
  if (
    normalized === 'materiales' ||
    normalized.includes('material') ||
    normalized.includes('madera') ||
    normalized.includes('sustentab') ||
    normalized.includes('ecolog') ||
    normalized.includes('fsc') ||
    normalized.includes('acabado') ||
    normalized.includes('cera') ||
    normalized.includes('aceite') ||
    normalized.includes('cuidado')
  ) {
    return {
      text: 'En Hermanos Jota cada pieza nace del respeto por la naturaleza y los oficios tradicionales:\n\n🌿 **Maderas nobles:** Trabajamos con maderas nativas argentinas (nogal, roble, guatambú, caldén, algarrobo) certificadas FSC® de manejo responsable.\n🌱 **Acabados ecológicos:** Aceite de lino 100% natural prensado en frío y cera de abejas de origen local, libres de compuestos tóxicos.\n♻️ **Compromiso:** 30% mínimo de materiales recuperados y cero plásticos descartables en toda nuestra cadena.',
      actions: [
        { id: 'garantia', label: '🛡️ Ver programa Herencia Viva' },
        { id: 'catalogo', label: '🛋️ Ver productos' },
      ],
    };
  }

  // 5. Garantía "Herencia Viva"
  if (
    normalized === 'garantia' ||
    normalized.includes('garantia') ||
    normalized.includes('herencia viva') ||
    normalized.includes('devolucion') ||
    normalized.includes('cambio') ||
    normalized.includes('recompra') ||
    normalized.includes('restauracion') ||
    normalized.includes('rotura')
  ) {
    return {
      text: 'Nuestras piezas están pensadas para trascender generaciones a través del programa **Herencia Viva**:\n\n🛡️ **10 años de garantía** en la estructura de madera maciza.\n🪵 **5 años de garantía** en acabados y herrajes de latón.\n🛠️ **Servicio de restauración:** Mantenimiento y puesta en valor de piezas antiguas.\n🔄 **Recompra garantizada:** Recompramos piezas bien conservadas por hasta el 40% de su valor comercial actual.',
      actions: [
        { id: 'horarios', label: '📍 Visitar taller' },
        { id: 'whatsapp', label: '💬 Consultar sobre garantía' },
      ],
    };
  }

  // 6. Pagos y Financiación
  if (
    normalized.includes('pago') ||
    normalized.includes('tarjeta') ||
    normalized.includes('cuota') ||
    normalized.includes('transferencia') ||
    normalized.includes('efectivo') ||
    (normalized.includes('precio') &&
      !normalized.includes('mueble') &&
      !normalized.includes('mesa'))
  ) {
    return {
      text: 'Aceptamos los siguientes medios de pago:\n\n💳 **Tarjetas de crédito:** Hasta 3 y 6 cuotas con las principales tarjetas.\n🏦 **Transferencia bancaria:** 10% de descuento abonando por transferencia.\n💵 **Efectivo en showroom:** 15% de descuento en nuestra Casa Taller.\n\nEmitimos factura A y B para consumidor final o empresas.',
      actions: [
        { id: 'catalogo', label: '🛋️ Ver catálogo' },
        { id: 'whatsapp', label: '💬 Consultar promociones bancarias' },
      ],
    };
  }

  // 7. Saludos / Apertura
  if (
    normalized === 'hola' ||
    normalized === 'buenas' ||
    normalized.startsWith('hola ') ||
    normalized.includes('buen dia') ||
    normalized.includes('buenas tardes') ||
    normalized.includes('buenas noches') ||
    normalized.includes('que tal')
  ) {
    return {
      text: '¡Hola! Es un gusto saludarte. En Hermanos Jota diseñamos muebles de diseño atemporal y sustentable. ¿Cómo podemos orientarte hoy?',
      actions: QUICK_ACTIONS,
    };
  }

  // 8. Búsqueda de Productos / Catálogo
  const isCatalogQuery =
    normalized === 'catalogo' ||
    normalized.includes('catalogo') ||
    normalized.includes('producto') ||
    normalized.includes('mueble') ||
    normalized.includes('buscar') ||
    normalized.includes('mesa') ||
    normalized.includes('silla') ||
    normalized.includes('sillon') ||
    normalized.includes('butaca') ||
    normalized.includes('biblioteca') ||
    normalized.includes('aparador') ||
    normalized.includes('escritorio') ||
    normalized.includes('banco') ||
    normalized.includes('living') ||
    normalized.includes('comedor') ||
    normalized.includes('dormitorio') ||
    normalized.includes('oficina') ||
    normalized.includes('almacenamiento') ||
    normalized.includes('stock');

  if (isCatalogQuery) {
    // Buscar en el catálogo
    const matchedProducts = searchProducts(
      normalized === 'catalogo' ? '' : normalized,
      catalog
    );

    if (matchedProducts.length > 0) {
      const isSpecificSearch =
        normalized !== 'catalogo' &&
        !normalized.includes('todo el catalogo') &&
        !normalized.includes('todos los productos');

      const messageHeader = isSpecificSearch
        ? `Encontré estas piezas de nuestro catálogo acordes a tu búsqueda:`
        : `Aquí tenés una selección destacada de nuestro catálogo actual:`;

      return {
        text: messageHeader,
        products: matchedProducts,
        actions: [
          {
            id: 'todos_productos',
            label: '🔍 Ver catálogo completo en la tienda',
            isLink: '/productos',
          },
          { id: 'horarios', label: '📍 Probar en el showroom' },
          { id: 'whatsapp', label: '💬 Consultar medidas personalizadas' },
        ],
      };
    } else {
      return {
        text: `No encontré piezas que coincidan exactamente con "${userText}" en este momento, pero nuestro catálogo se renueva con frecuencia y realizamos piezas a medida.`,
        actions: [
          {
            id: 'todos_productos',
            label: '🛋️ Ver todos los productos',
            isLink: '/productos',
          },
          { id: 'whatsapp', label: '💬 Consultar pieza a medida por WhatsApp' },
        ],
      };
    }
  }

  // 9. Respuesta por defecto con asistencia
  return {
    text: 'Entiendo tu consulta. Para brindarte la respuesta más precisa o asesoramiento a medida, podés seleccionar una de las siguientes opciones o escribirnos directamente a WhatsApp:',
    actions: QUICK_ACTIONS,
    whatsappLink: WHATSAPP_URL,
  };
}
