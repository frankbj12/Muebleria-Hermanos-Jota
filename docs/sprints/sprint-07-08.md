# Consigna Final — Sprint 7 y 8

**Proyecto:** Lanzamiento del E-commerce "Mueblería Hermanos Jota"  
**Entrega:** Fin del Sprint 8  
**Programa:** Full Stack Developer

---

## 1. Resumen del proyecto

Llegamos al sprint final. El objetivo de esta última entrega es transformar la aplicación en una plataforma de e-commerce completa, segura y funcional. Implementaremos el ciclo de vida completo de un usuario (registro, login y rutas protegidas), gestionaremos el estado global con la **Context API** de React y, finalmente, desplegaremos toda la aplicación en la nube.

Al finalizar, "Mueblería Hermanos Jota" no será solo un proyecto en tu computadora, sino un producto web vivo y funcional.

---

## 2. Objetivos de aprendizaje

1. Implementar un sistema de autenticación full stack seguro usando hashing (bcrypt) y JSON Web Tokens (JWT).
2. Proteger rutas de API en el backend con middleware de autorización.
3. Gestionar estado global complejo (autenticación y carrito) de forma eficiente con la React Context API.
4. Crear y gestionar rutas protegidas en el frontend con React Router.
5. Realizar un despliegue completo de una aplicación MERN, configurando frontend, backend y base de datos en producción.
6. Configurar variables de entorno para producción en plataformas de hosting.
7. Consolidar todas las habilidades del stack MERN en un único proyecto cohesivo.

---

## 3. Requisitos funcionales y de negocio

### Flujo de autenticación de usuarios

Queremos que nuestros clientes puedan crear una cuenta y acceder a ella de forma segura.

* **Registro (`/registro`):** formulario que envía datos a la API; la contraseña se hashea en el backend antes de guardarse.
* **Login (`/login`):** valida credenciales contra la base de datos y devuelve un JWT.
* **Persistencia de sesión:** el frontend almacena el JWT y mantiene al usuario logueado tras recargar la página.

### Experiencia de usuario dinámica y segura

El sitio debe saber quién es el usuario y mostrarle las opciones relevantes.

* **UI condicional:** la navegación cambia según el usuario esté logueado o no.
* **Logout:** limpia el token y actualiza el estado global.
* **Rutas protegidas (`/perfil`, `/mis-pedidos`):** inaccesibles sin autenticación; redirigen a login.

### Carrito de compras y proceso de pedido

El proceso de compra debe ser simple y registrar el pedido a nombre del cliente.

* El carrito se gestiona globalmente con Context API.
* **Finalizar Compra** solo funciona cuando el usuario está logueado.
* El `POST` del pedido usa el JWT para asociarlo al usuario.
* El carrito se vacía automáticamente tras un pedido exitoso.

### Despliegue público

¡El mundo debe ver nuestra mueblería! El sitio debe estar online y accesible.

---

## 4. Requisitos técnicos

### Backend

* Contraseñas hasheadas con bcrypt.
* Autenticación con JWT.
* Middleware de verificación de JWT en endpoints protegidos.

### Frontend

* Auth y carrito gestionados con Context API.
* Implementar el componente `<ProtectedRoute>`.
* Enviar el token en el encabezado `Authorization: Bearer <token>`.

### Despliegue

* Backend en Render.
* Frontend en Vercel o Netlify.
* Base de datos en MongoDB Atlas.
* Gestionar secretos como variables de entorno; nunca incluirlos directamente en el código.

---

## 5. Entregables finales

* **GH:** repositorio GitHub con el código fuente final de `/client` y `/backend`.
* **🌐 Frontend:** enlace a la aplicación desplegada y pública (por ejemplo, Vercel).
* **🚀 Backend:** enlace a la API desplegada y pública (por ejemplo, Render).
* **📄 README.md:** versión final y pulida, con enlaces a los sitios desplegados y descripción de la arquitectura.

---

*Full Stack Developer · Sprint 7 y 8*
