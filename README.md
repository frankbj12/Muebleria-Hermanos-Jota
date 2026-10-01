# 🪑Hermanos Jota



🛠️
👉

### Mueblería artesanal · E-commerce

Aplicación web para explorar muebles artesanales de diseño contemporáneo. El proyecto combina una interfaz en React con una API REST construida en Node.js y Express.

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://muebleria-hermanos-jota-grupo-13.vercel.app/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
## 🌐link de Vercel
👉[Muebleria Hermanos Jota](https://muebleria-hermanos-jota-grupo-13.vercel.app/)

**Diplomatura Full Stack · ITBA**

---

## 👥Equipo

| Integrante | GitHub |
| --- | --- |
| Franco Alegre | [@frankbj12](https://github.com/frankbj12) |
| Tomás Cupello | [@tomassnahuel](https://github.com/tomassnahuel) |
| Brian Reil | [@reilbrian](https://github.com/reilbrian) |
| Camilo Facundo Desza | [@CamiloD2212](https://github.com/CamiloD2212) |

## Experiencia

- **Inicio:** piezas destacadas, contenido de marca y video institucional.
- **Catálogo:** productos obtenidos desde la API, búsqueda y filtros por categoría.
- **Detalle:** especificaciones e información del producto seleccionado.
- **Carrito:** gestión de cantidades, eliminación de productos y cálculo de subtotal, con estado compartido mediante React Context.
- **Contacto:** formulario controlado con validación del lado del cliente.
- **Interfaz:** diseño responsive y navegación entre vistas con React Router.

## Tecnologías

| Área | Herramientas |
| --- | --- |
| Cliente | React, React Router, JavaScript, CSS |
| Servidor | Node.js, Express |
| Datos | Catálogo local en JavaScript |

## Puesta en marcha

**Requisitos:** Node.js y npm. El backend y el cliente se ejecutan en paralelo; abrí dos terminales desde la raíz del repositorio.

### 1. Iniciar la API

```bash
cd backend
npm install
npm run dev
```

La API estará disponible en `http://localhost:5000`.

### 2. Iniciar el cliente

```bash
cd client
npm install
npm start
```

El cliente se abrirá en `http://localhost:3000` y consultará la API local. Ambos procesos deben permanecer activos para cargar el catálogo.

## API

| Método | Endpoint | Respuesta |
| --- | --- | --- |
| `GET` | `/api/productos` | Catálogo completo en JSON. |
| `GET` | `/api/productos/:id` | Producto solicitado o `404` si no existe. |

Los datos se encuentran en `backend/data/products.js`. Express configura logging de solicitudes, parseo JSON, CORS para desarrollo local y manejadores de rutas no encontradas y errores.

## Estructura

```text
.
├── backend/                         API Node.js y Express
│   ├── data/
│   │   └── products.js              Fuente de datos del catálogo
│   ├── middlewares/
│   │   ├── errorHandler.js          Respuestas centralizadas de error
│   │   └── logger.js                Registro de método y URL
│   ├── routes/
│   │   └── productos.js             GET /api/productos y GET /:id
│   ├── index.js                     Configuración y arranque del servidor
│   └── package.json                 Dependencias y comandos del backend
│
├── client/                          Aplicación React
│   ├── public/
│   │   ├── assets/                  Imágenes, logo y videos usados por la UI
│   │   ├── index.html               Documento HTML de entrada de React
│   │   ├── manifest.json            Metadatos de la aplicación web
│   │   └── robots.txt               Directivas para rastreadores
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContactForm/         Formulario y datos de contacto
│   │   │   ├── Footer/              Pie de página
│   │   │   ├── Home/                Inicio y selección de destacados
│   │   │   ├── Navbar/              Navegación y contador del carrito
│   │   │   ├── ProductCard/         Tarjeta reutilizable de producto
│   │   │   ├── ProductDetail/       Vista detallada y acción de carrito
│   │   │   └── ProductList/         Catálogo, búsqueda y filtros
│   │   ├── context/
│   │   │   ├── CartContext.jsx      Estado y acciones compartidas del carrito
│   │   │   └── ToastContext.jsx     Notificaciones de la interfaz
│   │   ├── App.js                   Fetch del catálogo y rutas de la aplicación
│   │   ├── index.js                 Montaje de React y proveedores globales
│   │   ├── index.css                Estilos globales
│   │   ├── App.test.js              Prueba de navegación y flujo de compra
│   │   └── setupTests.js            Configuración de las pruebas
│   └── package.json                 Dependencias y comandos del cliente
│
├── assets/                          Copia original de los recursos gráficos
├── docs/
│   ├── sprint-01-02-legacy/         Versión anterior archivada (HTML/CSS/JS)
│   ├── sprints/                     Consignas de los sprints
│   ├── brand.md                     Manual de marca
│   └── products.md                  Información del catálogo
│
├── .agents/                         Skills e instrucciones auxiliares del agente
├── .husky/                          Hooks de Git del proyecto
├── AGENTS.md                        Criterios y reglas de trabajo del repositorio
├── eslint.config.js                 Configuración de ESLint
├── commitlint.config.cjs            Reglas para mensajes de commit
├── package.json                     Herramientas y scripts de la raíz
└── README.md                        Documentación del proyecto
```

### Cómo se organiza

- **`backend/`** contiene la API. `index.js` configura Express y monta middlewares y rutas; `routes/productos.js` consulta el catálogo definido en `data/products.js`.
- **`client/src/`** contiene la aplicación. `App.js` carga los productos desde la API y define las rutas; `components/` organiza la interfaz por responsabilidad; `context/` comparte el estado del carrito y las notificaciones.
- **`client/public/assets/`** contiene los recursos que el navegador solicita directamente. La carpeta raíz `assets/` conserva los recursos originales del proyecto.
- **`docs/`** reúne documentación funcional y de marca. `sprint-01-02-legacy/` es una referencia archivada y no forma parte de la aplicación React actual.
- **Configuración raíz**: `package.json`, ESLint, Husky y Commitlint dan soporte a tareas de desarrollo y colaboración; no son parte del runtime del sitio.


## Alcance actual

El catálogo se carga desde la API; el detalle se resuelve en el cliente a partir de esa lista. El carrito vive en memoria y se reinicia al recargar la página. El formulario de contacto muestra una confirmación simulada y no envía datos a un servicio. El checkout es informativo y no procesa pagos. MongoDB, autenticación y persistencia no están incluidos en esta etapa.
