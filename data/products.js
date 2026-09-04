/* =============================================
   DATOS DEL CATÁLOGO DE PRODUCTOS
   Hermanos Jota — Muebles Artesanales
   ============================================= */

const PRODUCTS = [
  {
    id: 1,
    name: "Aparador Uspallata",
    slug: "aparador-uspallata",
    description:
      "Aparador de seis puertas fabricado en nogal sostenible con tiradores metálicos en acabado latón. Su silueta minimalista realza el veteado natural de la madera.",
    price: 1890000,
    image: "assets/products/Aparador Uspallata.png",
    category: "almacenamiento",
    featured: false,
    specs: {
      medidas: "180 × 45 × 75 cm",
      materiales: "Nogal macizo FSC®, herrajes de latón",
      acabado: "Aceite natural ecológico",
      peso: "68 kg",
    },
  },
  {
    id: 2,
    name: "Biblioteca Recoleta",
    slug: "biblioteca-recoleta",
    description:
      "Sistema modular de estantes abierto que combina estructura de acero Sage Green y repisas en roble claro. Perfecta para colecciones y objetos de diseño.",
    price: 1450000,
    image: "assets/products/Biblioteca Recoleta.png",
    category: "almacenamiento",
    featured: false,
    specs: {
      medidas: "100 × 35 × 200 cm",
      materiales: "Estructura de acero, estantes de roble",
      acabado: "Laca mate ecológica",
      capacidad: "45 kg por estante",
    },
  },
  {
    id: 3,
    name: "Butaca Mendoza",
    slug: "butaca-mendoza",
    description:
      "Butaca tapizada en bouclé Dusty Rose con base de madera de guatambú. El respaldo curvo abraza el cuerpo y ofrece máximo confort.",
    price: 890000,
    image: "assets/products/Butaca Mendoza.png",
    category: "living",
    featured: true,
    specs: {
      medidas: "80 × 75 × 85 cm",
      materiales: "Guatambú macizo, tela bouclé",
      acabado: "Cera vegetal, tapizado premium",
      tapizado: "Repelente al agua y manchas",
    },
  },
  {
    id: 4,
    name: "Sillón Copacabana",
    slug: "sillon-copacabana",
    description:
      "Sillón lounge en cuero cognac con base giratoria en acero. Inspirado en la estética brasilera moderna de los 60, combina comodidad excepcional con un diseño icónico.",
    price: 1250000,
    image: "assets/products/Sillón Copacabana.png",
    category: "living",
    featured: false,
    specs: {
      medidas: "90 × 85 × 95 cm",
      materiales: "Cuero curtido vegetal, acero pintado",
      acabado: "Cuero anilina premium",
      rotación: "360° silenciosa y suave",
    },
  },
  {
    id: 5,
    name: "Mesa de Centro Araucaria",
    slug: "mesa-de-centro-araucaria",
    description:
      "Mesa de centro con sobre circular de mármol Patagonia y base de tres patas en madera de nogal. Minimalismo que se convierte en punto focal.",
    price: 780000,
    image: "assets/products/Mesa de Centro Araucaria.png",
    category: "living",
    featured: false,
    specs: {
      medidas: "90 × 90 × 45 cm",
      materiales: "Mármol Patagonia, patas de nogal",
      acabado: "Mármol pulido, aceite natural",
      peso: "42 kg",
    },
  },
  {
    id: 6,
    name: "Mesa de Noche Aconcagua",
    slug: "mesa-de-noche-aconcagua",
    description:
      "Mesa de noche con cajón oculto y repisa inferior en roble certificado FSC®. Diseño limpio y funcional para cualquier estilo de dormitorio.",
    price: 420000,
    image: "assets/products/Mesa de Noche Aconcagua.png",
    category: "dormitorio",
    featured: false,
    specs: {
      medidas: "45 × 35 × 60 cm",
      materiales: "Roble macizo FSC®, herrajes soft-close",
      acabado: "Barniz mate de poliuretano",
      almacenamiento: "1 cajón + repisa inferior",
    },
  },
  {
    id: 7,
    name: "Sofá Patagonia",
    slug: "sofa-patagonia",
    description:
      "Sofá de tres cuerpos tapizado en lino natural con patas cónicas de madera. Espuma de alta resiliencia con plumón reciclado para comodidad duradera.",
    price: 2350000,
    image: "assets/products/Sofá Patagonia.png",
    category: "living",
    featured: true,
    specs: {
      medidas: "220 × 90 × 80 cm",
      materiales: "Eucalipto FSC®, lino 100% natural",
      acabado: "Tapizado premium",
      relleno: "Espuma HR + plumón reciclado",
    },
  },
  {
    id: 8,
    name: "Mesa Comedor Pampa",
    slug: "mesa-comedor-pampa",
    description:
      "Mesa extensible de roble macizo con tablero biselado y sistema de apertura suave. Se adapta de 6 a 10 comensales para reuniones íntimas o grandes celebraciones.",
    price: 1950000,
    image: "assets/products/Mesa Comedor Pampa.png",
    category: "comedor",
    featured: true,
    specs: {
      medidas: "160-240 × 90 × 75 cm",
      materiales: "Roble macizo FSC®, mecanismo alemán",
      acabado: "Aceite-cera natural",
      capacidad: "6-10 comensales",
    },
  },
  {
    id: 9,
    name: "Sillas Córdoba",
    slug: "sillas-cordoba",
    description:
      "Set de cuatro sillas apilables en contrachapado moldeado de nogal y estructura tubular. Diseño ergonómico y materiales de calidad para el uso diario.",
    price: 1120000,
    image: "assets/products/Sillas Córdoba.png",
    category: "comedor",
    featured: false,
    specs: {
      medidas: "45 × 52 × 80 cm (c/u)",
      materiales: "Contrachapado nogal, tubo de acero",
      acabado: "Laca mate, pintura epoxi",
      incluye: "Set de 4 sillas",
    },
  },
  {
    id: 10,
    name: "Escritorio Costa",
    slug: "escritorio-costa",
    description:
      "Escritorio compacto con cajón organizado y tapa pasacables integrada en bambú laminado. Funcionalidad moderna con estética minimalista y sostenible.",
    price: 950000,
    image: "assets/products/Escritorio Costa.png",
    category: "trabajo",
    featured: true,
    specs: {
      medidas: "120 × 60 × 75 cm",
      materiales: "Bambú laminado, herrajes ocultos",
      acabado: "Laca mate resistente",
      cables: "Pasacables integrado",
    },
  },
  {
    id: 11,
    name: "Silla de Trabajo Belgrano",
    slug: "silla-de-trabajo-belgrano",
    description:
      "Silla ergonómica regulable en altura con respaldo de malla transpirable y asiento tapizado en tejido reciclado. Máximo confort para largas jornadas.",
    price: 680000,
    image: "assets/products/Silla de Trabajo Belgrano.png",
    category: "trabajo",
    featured: false,
    specs: {
      medidas: "60 × 60 × 90-100 cm",
      materiales: "Malla técnica, tejido reciclado",
      acabado: "Base cromada, tapizado premium",
      regulación: "Altura + inclinación respaldo",
    },
  },
];

/**
 * Simula una petición asíncrona para obtener todos los productos.
 * @returns {Promise<Array>}
 */
function fetchProducts() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(PRODUCTS);
    }, 300);
  });
}

/**
 * Simula una petición asíncrona para obtener los productos destacados.
 * @returns {Promise<Array>}
 */
function fetchFeaturedProducts() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      var featured = PRODUCTS.filter(function (p) {
        return p.featured;
      });
      resolve(featured);
    }, 300);
  });
}

/**
 * Formatea un precio numérico al formato argentino.
 * @param {number} price
 * @returns {string}
 */
function formatPrice(price) {
  return "$\u00A0" + price.toLocaleString("es-AR");
}
