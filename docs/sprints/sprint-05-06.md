# Consigna Final — Sprint 5 y 6

**Proyecto:** Persistencia de Datos y CRUD Completo  
**Entrega:** Fin del Sprint 6  
**Programa:** Full Stack Developer  

---

## 1. Resumen del proyecto

Este es el sprint que transforma el proyecto en una aplicación web real y persistente. Conectaremos la API de Express a una base de datos **MongoDB** en la nube e implementaremos el **CRUD completo** (Crear, Leer, Actualizar, Borrar) para los productos de "Mueblería Jota". El frontend de React evolucionará para crear, editar y eliminar productos a través de formularios interactivos, todo gestionado con un sistema de ruteo profesional.

---

## 2. Objetivos de aprendizaje

1. Conectar una aplicación de Node.js a una base de datos MongoDB usando Mongoose.
2. Definir Esquemas y Modelos de datos para estructurar la información.
3. Implementar una API RESTful con funcionalidad CRUD completa (GET, POST, PUT, DELETE) en Express.
4. Gestionar la configuración de la aplicación y los secretos de forma segura con variables de entorno (.env).
5. Crear una aplicación de React con múltiples páginas y rutas dinámicas utilizando React Router DOM (`useParams`).
6. Realizar navegación programática en React con `useNavigate` después de acciones del usuario.
7. Construir formularios controlados en React para enviar datos de creación y edición a la API.
8. Manejar el ciclo completo de una petición full stack, desde la interacción del usuario hasta el cambio en la base de datos.

---

## 3. Arquitectura del proyecto

`React Client (Frontend)` ⇄ `Express API (Backend)` ⇄ `MongoDB (Persistencia)`

---

## 4. Requisitos del backend (API)

### Modelo: `Product`

* `nombre`: String, required
* `descripcion`: String
* `precio`: Number, required
* `stock`: Number
* `imagenUrl`: String

### Endpoints

* `GET /api/productos` — devuelve todos los productos
* `GET /api/productos/:id` — devuelve un producto por `_id`
* `POST /api/productos` — crea un producto, responde 201
* `PUT /api/productos/:id` — actualiza un producto existente
* `DELETE /api/productos/:id` — elimina un producto

---

## 5. Requisitos del frontend (React)

* `/` — Inicio
* `/productos` — Catálogo
* `/productos/:id` — Detalle (`useParams`)
* `/contacto` — Formulario
* `/admin/crear-producto` — Alta de producto

---

## 6. Entregables

* **GH:** Repositorio GitHub con las carpetas `/client` y `/backend`.
* **🌐:** Frontend desplegado en Vercel o Netlify.
* **🚀:** Backend desplegado en Render.
* **📄 README.md:** Actualizado con los enlaces a ambos despliegues y las instrucciones para configurar las variables de entorno necesarias.

---

*Full Stack Developer · Sprint 5 y 6*
