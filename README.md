# 🪑 Hermanos Jota

### Mueblería artesanal · E-commerce

Aplicación full stack para explorar un catálogo de muebles artesanales y gestionar sus productos. El frontend está construido con React y React Router; la API REST usa Node.js, Express y Mongoose, con persistencia en MongoDB Atlas.

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://muebleria-hermanos-jota-grupo-13.vercel.app/)
[![Render Deployment](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://muebleria-hermanos-jota-api-b051.onrender.com/api/health)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)

- **Frontend:** [muebleria-hermanos-jota-grupo-13.vercel.app](https://muebleria-hermanos-jota-grupo-13.vercel.app/)
- **API:** [muebleria-hermanos-jota-api-b051.onrender.com](https://muebleria-hermanos-jota-api-b051.onrender.com/api/health)

**Diplomatura Full Stack · ITBA**

---

## 👥Equipo

| Integrante | GitHub |
| --- | --- |
| Franco Alegre | [@frankbj12](https://github.com/frankbj12) |
| Tomás Cupello | [@tomassnahuel](https://github.com/tomassnahuel) |
| Brian Reil | [@reilbrian](https://github.com/reilbrian) |
| Camilo Facundo Desza | [@CamiloD2212](https://github.com/CamiloD2212) |


## 🛠️Tecnologías

| Área | Herramientas |
| --- | --- |
| Cliente | React, React Router, JavaScript, CSS |
| Servidor | Node.js, Express |
| Datos | MongoDB Atlas, Mongoose |
| Despliegue | Vercel (frontend), Render (API) |

## 🛠️Puesta en marcha

**Requisitos:** Node.js y npm. Para ejecutar toda la aplicación localmente, necesitás una URI de MongoDB Atlas con permisos de acceso.

### 1. Configurar e iniciar la API

```bash
cd backend
npm install
```

Copiá `backend/.env.example` a `backend/.env` y completá `MONGODB_URI` con tus credenciales. No compartas ni subas el archivo `.env`.

```env
PORT=5000
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>/<base>
CORS_ORIGIN=http://localhost:3000
```

Iniciá el servidor:

```bash
npm run dev
```

La API local estará disponible en `http://localhost:5000`.

### 2. Configurar e iniciar el frontend

```bash
cd client
npm install
```

Para usar la API local, no hace falta configurar `REACT_APP_API_URL`: el cliente usa `http://localhost:5000/api/productos` por defecto. Para apuntar a la API desplegada, creá `client/.env.local`:

```env
REACT_APP_API_URL=https://muebleria-hermanos-jota-api-b051.onrender.com/api/productos
```

Luego iniciá React:

```bash
npm start
```

El frontend se abrirá en `http://localhost:3000`. Para usar la API local, mantené ambos procesos activos. Si cambiás una variable `REACT_APP_*`, reiniciá el servidor de desarrollo.

### Variables en producción

- **Render:** definir `MONGODB_URI` y `CORS_ORIGIN` en la configuración del servicio. `CORS_ORIGIN` debe incluir el origen exacto del frontend publicado.
- **Vercel:** definir `REACT_APP_API_URL` con `https://muebleria-hermanos-jota-api-b051.onrender.com/api/productos` y volver a desplegar el frontend.

No guardes credenciales ni secretos en el repositorio. El archivo `.env.example` documenta los nombres de variables sin contener valores secretos.

## ⚙API

La API utiliza el modelo `Product` y persiste los registros en MongoDB. Los productos se manejan con campos en inglés (`name`, `description`, `price`, `stock`, `image`, `category`, `featured`, `specs`) y su identificador MongoDB (`_id`/`id`).

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/api/health` | Estado de la API. |
| `GET` | `/api/productos` | Lista de productos. |
| `GET` | `/api/productos/:id` | Producto por ID; responde `404` si no existe. |
| `POST` | `/api/productos` | Crea un producto y responde `201`. |
| `PUT` | `/api/productos/:id` | Actualiza un producto existente. |
| `DELETE` | `/api/productos/:id` | Elimina un producto existente. |

También están disponibles las rutas CRUD bajo `/productos` para compatibilidad.

## 📂Estructura

```text
.
├── backend/                         API Node.js y Express
│   ├── config/
│   │   └── db.js                    Conexión a MongoDB
│   ├── controllers/
│   │   └── productosController.js   Operaciones CRUD
│   ├── models/
│   │   └── Product.js               Esquema y modelo Mongoose
│   ├── middlewares/
│   │   ├── errorHandler.js          Respuestas centralizadas de error
│   │   └── logger.js                Registro de método y URL
│   ├── routes/
│   │   └── productos.js             Endpoints de productos
│   ├── index.js                     Configuración y arranque del servidor
│   ├── seed.js                      Carga inicial de productos
│   ├── .env.example                 Plantilla de variables de entorno
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
│   │   │   ├── Cart/                Vista e ítem reutilizable del carrito
│   │   │   ├── ContactForm/         Formulario y datos de contacto
│   │   │   ├── Footer/              Pie de página
│   │   │   ├── Home/                Inicio y selección de destacados
│   │   │   ├── Navbar/              Navegación y contador del carrito
│   │   │   ├── ProductCard/         Tarjeta reutilizable de producto
│   │   │   ├── ProductDetail/       Detalle dinámico y pruebas de ruta
│   │   │   └── ProductList/         Catálogo, búsqueda y filtros
│   │   ├── context/
│   │   │   ├── CartContext.jsx      Carrito persistido en localStorage
│   │   │   ├── CartContext.test.jsx Pruebas de persistencia del carrito
│   │   │   ├── ProductsContext.jsx  Estado, carga y actualización del catálogo
│   │   │   ├── ProductsContext.test.jsx Prueba de actualización tras un alta
│   │   │   └── ToastContext.jsx     Notificaciones de la interfaz
│   │   ├── App.js                   Rutas de la aplicación
│   │   ├── index.js                 Montaje de React y proveedores globales
│   │   ├── index.css                Estilos globales
│   │   ├── services/
│   │   │   ├── productosApi.js      Acceso HTTP a los endpoints de productos
│   │   │   └── productosApi.test.js Pruebas del servicio HTTP
│   └── package.json                 Dependencias y comandos del cliente
│
├── assets/                          Copia original de los recursos gráficos
├── docs/
│   ├── sprints/                     Consignas de los sprints
│   ├── sprint-01-02-legacy/         Versión anterior archivada (HTML/CSS/JS)
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

### 📜Cómo se organiza

- **`backend/`** contiene la API. `index.js` configura Express y monta middlewares y rutas; `config/db.js` conecta MongoDB y el controlador implementa el CRUD.
- **`client/src/`** contiene la aplicación. `App.js` define las rutas; `services/productosApi.js` centraliza las peticiones HTTP y adapta la respuesta de la API al modelo en inglés; `ProductsContext.jsx` gestiona la carga y actualización del catálogo.
- **Carrito:** `CartContext.jsx` administra el carrito y lo conserva en `localStorage` al recargar la página.
- **`client/public/assets/`** contiene los recursos que el navegador solicita directamente. La carpeta raíz `assets/` conserva los recursos originales del proyecto.
- **`docs/`** reúne documentación funcional y de marca. `sprint-01-02-legacy/` es una referencia archivada y no forma parte de la aplicación React actual.
- **Configuración raíz**: `package.json`, ESLint, Husky y Commitlint dan soporte a tareas de desarrollo y colaboración; no son parte del runtime del sitio.


## ✅ Alcance y validación

- Catálogo desde la API, búsqueda, filtros y detalle por ID.
- Panel y formularios de administración con operaciones CRUD sobre la API.
- Pruebas del frontend: desde `client/`, ejecutá `npm test -- --watchAll=false`.
- Build de producción: desde `client/`, ejecutá `npm run build`.

El formulario de contacto muestra una confirmación de interfaz y no envía datos a un servicio. El checkout es informativo y no procesa pagos. La aplicación no incluye autenticación de usuarios.
