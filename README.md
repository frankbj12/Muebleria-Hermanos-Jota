# 🪑 Hermanos Jota

### Mueblería artesanal · E-commerce

Aplicación Full Stack de comercio electrónico para una mueblería artesanal. Permite explorar el catálogo de productos, gestionar inventario y pedidos, realizar compras con actualización automática de stock y administrar cuentas de usuario con autenticación y control de acceso por roles.

El frontend está desarrollado con React 19 y React Router. El backend utiliza Node.js, Express y Mongoose, con persistencia en MongoDB Atlas y almacenamiento de imágenes mediante Vercel Blob.

[![MongoDB](https://img.shields.io/badge/MongoDB-023430?style=for-the-badge&logo=MongoDB)](https://www.mongodb.com/es/docs/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io/)

### 🌐 DEMO: [Muebleria Hermanos JOTA](https://muebleria-hermanos-jota-grupo-j.vercel.app/)
---
## 👥 Equipo

| Integrante | GitHub |
| --- | --- |
| Franco Alegre | [@frankbj12](https://github.com/frankbj12) |
| Tomás Cupello | [@tomassnahuel](https://github.com/tomassnahuel) |
| Brian Reil | [@reilbrian](https://github.com/reilbrian) |
| Camilo Facundo Desza | [@CamiloD2212](https://github.com/CamiloD2212) |

---

## 🛠️ Tecnologías

| Área | Herramientas |
| --- | --- |
| Cliente | React 19, React Router, Context API, CSS3, HTML5 |
| Servidor | Node.js, Express, Multer, Helmet, express-rate-limit |
| Autenticación | JSON Web Tokens (JWT), bcryptjs |
| Datos y Media | MongoDB Atlas, Mongoose, Vercel Blob SDK |
| Testing | Jest, Supertest, React Testing Library |

---

## 🛠️ Puesta en marcha

**Requisitos:** Node.js y npm. Para ejecutar toda la aplicación localmente, necesitás una URI de MongoDB Atlas (o instancia local) con permisos de acceso.

### 1. Configurar e iniciar la API

```bash
cd backend
npm install
```

Copiá `backend/.env.example` a `backend/.env` y completá las variables de configuración. No compartas ni subas el archivo `.env`.

```env
PORT=5000
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>/<base>
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=tu_secreto_para_firmar_tokens
JWT_EXPIRES_IN=1d
ADMIN_NAME=Administrador
ADMIN_EMAIL=admin@muebleriajota.com
ADMIN_PASSWORD=PasswordSeguro123!
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxxxxxxxx"
```

**Carga de datos y usuario administrador:**
- Para cargar el catálogo inicial de productos:
  ```bash
  npm run seed
  ```
- Para crear el usuario administrador inicial según los datos de tu `.env`:
  ```bash
  npm run seed:admin
  ```

Iniciá el servidor:

```bash
npm run dev
```

La API local estará disponible en `http://localhost:5000` (chequeo de estado en `http://localhost:5000/api/health`).

---

### 2. Configurar e iniciar el frontend

```bash
cd client
npm install
```

Para usar la API local, no hace falta configurar `REACT_APP_API_URL`: el cliente se conecta a `http://localhost:5000` por defecto. Si necesitás especificar una URL base distinta, creá `client/.env.local`:

```env
REACT_APP_API_URL=http://localhost:5000
```

Iniciá React:

```bash
npm start
```

El frontend se abrirá en `http://localhost:3000`.

---

## 🔐 Roles y Niveles de Acceso

La aplicación implementa permisos diferenciados según el estado de la sesión y el rol del usuario:

| Nivel / Rol | Acceso en la Aplicación | Permisos de API |
| :--- | :--- | :--- |
| **Visitante**<br>*(Sin sesión / Anónimo)* | • Exploración del catálogo, búsqueda en tiempo real y filtros.<br>• Detalle de productos, medidas y especificaciones técnicas.<br>• Armado del carrito de compras (persistido en `localStorage`).<br>• Formulario de contacto y páginas legales.<br>• *Al intentar comprar o ingresar a `/perfil`, `/mis-pedidos` o `/admin`, es redirigido a `/login`.* | • Consultas públicas (`GET /api/productos`, `GET /api/upload`, `GET /api/health`).<br>• Registro (`POST /api/auth/register`).<br>• Login con rate limiter (`POST /api/auth/login`). |
| **Cliente**<br>*(Sesión activa · Rol `user`)* | • Todo lo anterior.<br>• Acceso a su perfil personal en `/perfil` y cierre de sesión.<br>• **Finalización de compra (Checkout):** creación de orden, descuento atómico de stock en base de datos, vaciado de carrito y confirmación con ID de pedido.<br>• Consulta de historial de compras en `/mis-pedidos` con seguimiento de estado.<br>• *Sin acceso al panel `/admin` (restringido por `<ProtectedRoute>` y middleware).* | • Todos los accesos públicos.<br>• Restauración de sesión (`GET /api/auth/me`).<br>• Creación de órdenes (`POST /api/pedidos`).<br>• Historial de pedidos personal (`GET /api/pedidos/mis-pedidos`). |
| **Administrador**<br>*(Sesión activa · Rol `admin`)* | • Todo lo anterior.<br>• Acceso exclusivo al panel de control `/admin`.<br>• **Gestión de inventario:** alta, edición y baja de productos, control de stock y subida de imágenes a Vercel Blob.<br>• **Gestión de pedidos:** listado global de todas las órdenes de compra y cambio de estado (`pending`, `completed`, `cancelled`).<br>• *El usuario inicial se genera ejecutando `npm run seed:admin` con los datos definidos en `backend/.env`.* | • Todos los accesos anteriores.<br>• Alta/edición/baja de productos (`POST`, `PUT`, `DELETE /api/productos`).<br>• Subida/baja de archivos (`POST`, `DELETE /api/upload`).<br>• Listado y actualización de órdenes (`GET`, `PATCH /api/pedidos/admin/*`). |

---

## ⚙️ API

La API maneja modelos de `Product`, `User` y `Order` persistidos en MongoDB. Todas las respuestas son emitidas en formato JSON. Los endpoints protegidos requieren el encabezado `Authorization: Bearer <token>`.

### Autenticación (`/api/auth`)

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Público | Registra un nuevo usuario con contraseña hasheada (`bcrypt`). |
| `POST` | `/api/auth/login` | Público *(Rate limit)* | Valida credenciales y devuelve JWT. Limita a 5 intentos cada 15 min por IP. |
| `GET` | `/api/auth/me` | Protegido *(JWT)* | Devuelve los datos del usuario autenticado a partir del token. |

### Pedidos y Checkout (`/api/pedidos`)

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/pedidos` | Protegido *(JWT)* | Registra un pedido, valida y descuenta stock atómicamente en la base de datos. |
| `GET` | `/api/pedidos/mis-pedidos` | Protegido *(JWT)* | Lista los pedidos correspondientes al usuario autenticado. |
| `GET` | `/api/pedidos/admin/all` | Protegido *(Admin)* | Lista todas las órdenes registradas en el sistema para gestión. |
| `PATCH` | `/api/pedidos/admin/:id/status` | Protegido *(Admin)* | Actualiza el estado de una orden (`pending`, `completed`, `cancelled`). |

### Catálogo de productos (`/api/productos`)

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Público | Estado de la API y tiempo de actividad. |
| `GET` | `/api/productos` | Público | Lista de productos con soporte para búsqueda y categorías. |
| `GET` | `/api/productos/:id` | Público | Producto por ID; responde `404` si no existe. |
| `POST` | `/api/productos` | Protegido *(Admin)* | Crea un nuevo producto en el catálogo. |
| `PUT` | `/api/productos/:id` | Protegido *(Admin)* | Actualiza un producto existente. |
| `DELETE` | `/api/productos/:id` | Protegido *(Admin)* | Elimina un producto existente. |

### Almacenamiento multimedia (`/api/upload`)

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/upload` | Público | Lista las imágenes almacenadas en Vercel Blob ordenadas por fecha. |
| `POST` | `/api/upload` | Protegido *(Admin)* | Sube una imagen (`multipart/form-data`, máx. 5 MB) a Vercel Blob y responde con su URL pública. |
| `DELETE` | `/api/upload` | Protegido *(Admin)* | Elimina una imagen de Vercel Blob a partir de su URL. |

---

## 📂 Estructura

```text
.
├── backend/                             API Node.js y Express
│   ├── config/
│   │   └── db.js                        Conexión a MongoDB Atlas
│   ├── controllers/
│   │   ├── authController.js            Registro, login y sesión (/me)
│   │   ├── pedidosController.js         Gestión de pedidos, actualización de estados y control de stock
│   │   └── productosController.js       Operaciones CRUD de catálogo
│   ├── middlewares/
│   │   ├── errorHandler.js              Respuestas centralizadas de error
│   │   ├── logger.js                    Registro de peticiones en consola
│   │   ├── loginRateLimiter.js          Límite de tasa en login (5 intentos / 15m)
│   │   ├── requireAdmin.js              Control de acceso para rol administrador
│   │   └── verifyToken.js               Validación de JWT en encabezado Bearer
│   ├── models/
│   │   ├── Order.js                     Esquema y modelo de pedidos
│   │   ├── Product.js                   Esquema y modelo de productos
│   │   └── User.js                      Esquema y modelo de usuarios
│   ├── routes/
│   │   ├── auth.js                      Rutas de autenticación
│   │   ├── pedidos.js                   Rutas de pedidos y órdenes
│   │   ├── productos.js                 Rutas del catálogo de productos
│   │   └── upload.js                    Subida y gestión de imágenes (Vercel Blob)
│   ├── tests/                           Pruebas de integración del backend
│   ├── index.js                         Configuración del servidor, Helmet y CORS
│   ├── seed.js                          Carga inicial de productos
│   ├── seedAdmin.js                     Creación de usuario administrador
│   ├── .env.example                     Plantilla de variables de entorno
│   └── package.json                     Dependencias y comandos del backend
│
├── client/                              Aplicación React
│   ├── public/
│   │   ├── assets/                      Imágenes, logos e iconos
│   │   │   └── products/                Imágenes del catálogo e imagen de mantenimiento
│   │   ├── index.html                   Documento HTML de entrada
│   │   └── manifest.json                Metadatos de la aplicación web
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/                   Panel de administración, métricas y órdenes
│   │   │   ├── AnnouncementBar/         Barra superior de avisos
│   │   │   ├── Auth/                    LoginPage, RegisterPage y ProtectedRoute
│   │   │   ├── Cart/                    Carrito de compras y CheckoutModal
│   │   │   ├── Chatbot/                 Asistente interactivo
│   │   │   ├── ContactForm/             Formulario de contacto
│   │   │   ├── Footer/                  Pie de página y arrepentimiento
│   │   │   ├── Home/                    Inicio y carrusel de destacados
│   │   │   ├── Legal/                   Términos, privacidad y devoluciones
│   │   │   ├── Navbar/                  Navegación dinámica según estado de sesión
│   │   │   ├── NotFound/                Vista 404 personalizada
│   │   │   ├── Orders/                  Historial de compras del usuario
│   │   │   ├── ProductCard/             Tarjeta de producto reutilizable
│   │   │   ├── ProductDetail/           Detalle dinámico y especificaciones
│   │   │   ├── ProductList/             Catálogo con filtros y búsqueda
│   │   │   ├── User/                    Página de perfil de usuario
│   │   │   └── WhatsAppButton/          Acceso a WhatsApp
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          Estado de sesión, login, registro y token JWT
│   │   │   ├── CartContext.jsx          Carrito persistido en localStorage
│   │   │   ├── ProductsContext.jsx      Estado y carga reactiva del catálogo
│   │   │   ├── RepentanceModalContext.jsx Modal de arrepentimiento de compra
│   │   │   └── ToastContext.jsx         Notificaciones globales
│   │   ├── services/
│   │   │   ├── apiClient.js             Cliente HTTP centralizado con token Bearer
│   │   │   ├── pedidosApi.js            Acceso a endpoints de pedidos
│   │   │   └── productosApi.js          Acceso a endpoints de productos
│   │   ├── utils/
│   │   │   └── imageUrl.js              Resolución de URLs y fallback de imágenes
│   │   ├── App.js                       Declaración de rutas de la aplicación
│   │   ├── index.js                     Montaje del root de React
│   │   └── index.css                    Variables y estilos del sistema
│   ├── .env.example                     Plantilla de variables del cliente
│   └── package.json                     Dependencias y comandos del cliente
│
├── .agents/                             Skills, instrucciones y configuraciones para agentes
├── .husky/                              Hooks de Git del proyecto
├── AGENTS.md                            Instrucciones generales y convenciones de desarrollo para agentes
├── eslint.config.js                     Configuración de ESLint
├── commitlint.config.cjs                Reglas para mensajes de commit
├── package.json                         Herramientas y scripts de la raíz
├── docs/                                Documentación y especificaciones
└── README.md                            Documentación del proyecto
```

### 📜 Cómo se organiza

- **`backend/`** contiene la API Express. Las rutas están modularizadas (`auth.js`, `pedidos.js`, `productos.js` y `upload.js`). Los controladores manejan la lógica de negocio y persistencia en MongoDB con Mongoose. La seguridad se gestiona mediante middlewares centralizados (`verifyToken`, `requireAdmin`, `loginRateLimiter` y `helmet`).
- **`client/src/`** contiene la aplicación React. El estado global está organizado en Contextos (`AuthContext` para sesión con JWT, `CartContext` con persistencia en `localStorage`, `ProductsContext` para catálogo y `ToastContext` para feedback). Las rutas privadas se encuentran protegidas por el componente `<ProtectedRoute>`.
- **`services/`** centraliza las peticiones HTTP (`apiClient.js`), inyectando automáticamente el token Bearer en las llamadas que lo requieren y gestionando la URL base de forma uniforme.

---

## ✅ Alcance y validación

- **Autenticación y usuarios:** Registro con validación en tiempo real y contraseña hasheada (`bcryptjs`); inicio de sesión con JWT y persistencia en `localStorage`; perfil de usuario y cierre de sesión.
- **Rutas protegidas:** Acceso condicional en frontend mediante `<ProtectedRoute>` para `/perfil`, `/mis-pedidos` y el panel `/admin`, con protección correspondiente a nivel de API (`verifyToken` y `requireAdmin`).
- **Catálogo interactivo:** Búsqueda en tiempo real, filtros combinados por categoría y nivel de stock, vista detallada por ID y carrusel continuo en página de inicio.
- **Carrito y Checkout:** Gestión de carrito en `localStorage`, verificación de inicio de sesión previa a la compra, envío de orden a la API con descuento de existencias en MongoDB y modal de confirmación con identificador de compra.
- **Historial de pedidos:** Visualización cronológica de órdenes personales en `/mis-pedidos` con estados de elaboración.
- **Panel de administración:** Inventario con métricas, altas/ediciones con medidas compuestas y subida a Vercel Blob, confirmación destructiva y administración de pedidos de clientes.
- **Seguridad:** Cabeceras HTTP protegidas con Helmet y límite de intentos en el login para mitigar ataques de fuerza bruta.

### Pruebas automatizadas

- **Pruebas de frontend:** desde `client/`, ejecutá:
  ```bash
  npm test -- --watchAll=false
  ```

- **Pruebas de backend:** desde `backend/`, ejecutá:
  ```bash
  npm test
  ```

---

**Diplomatura Full Stack · ITBA**

---
