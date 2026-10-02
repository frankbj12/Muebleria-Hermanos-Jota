# Consigna Final — Sprint 3 y 4

**Proyecto:** E-commerce Mueblería Hermanos Jota  
**Entrega:** Fin del Sprint 4  
**Programa:** Full Stack Developer  

---

## 1. Resumen del proyecto

¡Es hora de la gran transformación! Reconstruiremos todo el frontend desde cero usando **React** y construiremos nuestro propio backend con **Node.js y Express** para servir los datos de los productos. El objetivo es crear una verdadera aplicación cliente-servidor: el frontend ya no usará datos locales, sino que hará peticiones a nuestra propia API para obtener la información y mostrarla dinámicamente.

---

## 2. Objetivos de aprendizaje

1. Construir un servidor web y una API REST básica utilizando Node.js y Express.
2. Definir y organizar rutas de API de forma modular con `express.Router`.
3. Implementar middlewares personalizados para funcionalidades como el logging.
4. Reconstruir una interfaz de usuario utilizando la arquitectura de componentes de React.
5. Manejar el estado de los componentes y de la aplicación con el hook `useState`.
6. Pasar datos entre componentes utilizando `props`.
7. Manejar la interacción del usuario con eventos de React.
8. Renderizar listas de datos dinámicamente con `.map()` y usar `keys` correctamente.
9. Implementar renderizado condicional para mostrar diferentes vistas en la UI.
10. Conectar una aplicación de React a una API de backend usando `fetch` y manejar el ciclo de vida de la petición (carga, éxito, error).

---

## 3. Arquitectura del proyecto

* `/backend` — Contendrá toda la aplicación de Node.js y Express.
* `/client` — Contendrá toda la aplicación de React (creada con `create-react-app`).

---

## 4. Requisitos técnicos

### Backend — Express
* Datos de productos en archivo `.js` local (array de objetos).
* `GET /api/productos` → listado completo en JSON.
* `GET /api/productos/:id` → producto por id, 404 si no existe.
* Middleware global de logging (método y URL).
* Middleware `express.json()` para futuras peticiones POST.
* Rutas organizadas con `express.Router`.
* Manejador de 404 y manejador de errores centralizado.

### Frontend — React
* Componentes: `Navbar`, `Footer`, `ProductCard`, `ProductList`, `ProductDetail`, `ContactForm`.
* Fetch a `GET /api/productos` con estados de carga y error.
* Renderizado de lista con `.map()` y `keys`.
* Detalle de producto vía renderizado condicional.
* Carrito de compras como estado en `App.js`, contador en `Navbar` vía `props`.
* Formulario de contacto controlado con `useState`.

---

## 5. Entregables

* **GH:** Repositorio GitHub con las carpetas `/client` y `/backend`, con historial de commits de todos los integrantes.
* **📄 README.md:** Con nombre del proyecto e integrantes, instrucciones de instalación y ejecución de ambos servidores, y descripción de la arquitectura y decisiones tomadas.