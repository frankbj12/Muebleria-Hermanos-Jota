# 🪑 Hermanos Jota — Mueblería Artesanal

> **Muebles de madera maciza diseñados para durar generaciones.**  
> Proyecto grupal de e-commerce frontend desarrollado en el marco de la Diplomatura Full Stack del **ITBA**.

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://muebleria-hermanos-jota-eight.vercel.app/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)

---

## 🌐 Sitio Web en Producción

Visita el proyecto en vivo aquí:  
👉 **[Hermanos Jota — Muebles artesanales con alma](https://muebleria-hermanos-jota-eight.vercel.app/)**

---

## 👥 Integrantes del Equipo

| Integrante | GitHub |
| :--- | :--- |
| **Franco Alegre** | [@frankbj12](https://github.com/frankbj12) |
| **Miqueas Córdoba** | [@mickx79](https://github.com/mickx79) |
| **Tomás Cupello** | [@tomassnahuel](https://github.com/tomassnahuel) |
| **Brian Reil** | [@reilbrian](https://github.com/reilbrian) |

> La consigna establece equipos de 5 integrantes. Actualmente el repositorio registra 4; falta incorporar el quinto integrante antes de la entrega.

---

## 📖 Acerca del Proyecto

**Hermanos Jota** es un e-commerce concebido para reflejar la identidad visual, calidez y excelencia artesanal de una mueblería boutique de diseño contemporáneo en madera maciza.

El objetivo de esta etapa fue construir una fachada frontend completa, interactiva y responsiva con tecnologías del lado del cliente (**Vanilla HTML5, CSS3 y JavaScript ES6+**), simulando una experiencia de compra real sin dependencias de backend ni frameworks externos.

---

## ✨ Características y Funcionalidades

### 🏠 1. Página de Inicio (`index.html`)
- **Hero Section inmersivo** con llamado a la acción (*CTA*).
- **Sección de Productos Destacados**: Renderizado dinámico de piezas seleccionadas.
- **Narrativa de Marca**: Sección de historia, valores artesanales, compromiso con la sustentabilidad y materiales nobles.
- **Contenido Multimedia**: Integración de video institucional y publicitario.
- **Garantías y Confianza**: Bloques informativos de envíos a todo el país, cuotas y garantía estructural.

### 🛋️ 2. Catálogo Interactivo (`productos.html`)
- **Carga dinámica del catálogo**: Consumo de base de datos local estructurada en JavaScript (`data/products.js`).
- **Filtros por categoría en tiempo real**: Living, Comedor, Dormitorio, Trabajo y Todos.
- **Buscador en vivo**: Filtrado por coincidencia de texto en nombres y descripciones.
- **Estados vacíos**: Mensaje interactivo cuando ninguna búsqueda coincide.

### 📦 3. Detalle de Producto (`producto.html`)
- **Carga dinámica por parámetros de URL** (`?id=...`).
- **Vista detallada**: Galería con imagen principal en alta calidad, descripción artesanal, medidas, tipo de madera, acabado y garantía.
- **Botón de adición directa al carrito**.

### 🛒 4. Carrito de Compras (`carrito.html`)
- **Persistencia en `localStorage`**: Los productos se mantienen guardados entre sesiones y páginas.
- **Badge en tiempo real**: Contador de productos visibles en el header de navegación.
- **Gestión completa**: Modificación de cantidades (+ / -), eliminación individual y vaciado de carrito.
- **Cálculo automático de costos**: Subtotal, costo de envío y total general.
- **Checkout simulado**: Confirmación mediante mensaje del navegador, sin procesamiento real de pagos.

### ✉️ 5. Página de Contacto (`contacto.html`)
- **Formulario interactivo**: Validación del lado del cliente de campos obligatorios y formato de email, con feedback en el DOM.
- **Información del taller & showroom**: Horarios de atención, dirección y canales de comunicación directa.

### 📱 6. Experiencia UI/UX & Responsive Design
- **Diseño Mobile-First**: Adaptación fluida para smartphones, tablets y pantallas de escritorio.
- **Navegación Móvil**: Menú hamburguesa interactivo y accesible.
- **Microinteracciones y Animaciones**: Efectos hover, transiciones suaves y feedback al agregar productos.

---

## 🛠️ Stack Tecnológico

- **HTML5 Semántico**: Estructura accesible y optimizada.
- **CSS3 Moderno**: Variables personalizadas (Design Tokens), CSS Grid, Flexbox, transiciones y animaciones.
- **JavaScript (ES6+)**: Modular, manipulación del DOM, gestión del estado con Web Storage API (`localStorage`), manipulación de URL (`URLSearchParams`) y validación de formularios.
- **Git & GitHub**: Control de versiones, trabajo en equipo mediante ramas y pull requests.
- **Vercel**: Plataforma de integración y despliegue continuo (CI/CD).

---

## 📂 Estructura del Proyecto

```text
muebleria-hermanos-jota/
│
├── index.html               # Página de inicio / Hero / Destacados / Historia
├── productos.html           # Catálogo completo con filtros y búsqueda
├── producto.html            # Vista de detalle de producto dinámico (?id=...)
├── carrito.html             # Carrito de compras con persistencia y checkout
├── contacto.html            # Formulario de contacto y datos del showroom
├── estilos.css              # Hoja de estilos global, variables y responsive design
├── script.js                # Lógica principal, carrito, eventos y manipulación del DOM
├── README.md                # Documentación general del repositorio
├── AGENTS.md                # Reglas y directrices de desarrollo
│
├── data/
│   └── products.js          # Base de datos local de productos en JavaScript
│
├── assets/
│   ├── logo.svg             # Isotipo y logotipo de Hermanos Jota
│   ├── products/            # Fotografías de productos en alta resolución
│   │   ├── Aparador Uspallata.png
│   │   ├── Biblioteca Recoleta.png
│   │   ├── Butaca Mendoza.png
│   │   ├── Escritorio Costa.png
│   │   ├── Mesa Comedor Pampa.png
│   │   ├── Mesa de Centro Araucaria.png
│   │   ├── Mesa de Noche Aconcagua.png
│   │   ├── Silla de Trabajo Belgrano.png
│   │   ├── Sillas Córdoba.png
│   │   ├── Sillón Copacabana.png
│   │   └── Sofá Patagonia.png
│   └── videos/              # Material audiovisual institucional y publicitario
│       ├── publicidad IG.mp4
│       └── Video institucional Hermanos Jota.mp4
│
└── docs/
    ├── brand.md             # Identidad, valores, paleta y tipografía de la marca
    ├── products.md          # Especificaciones técnicas de los productos
    └── sprints/
        └── sprint-01-02.md  # Requisitos y alcance del Sprint 1–2
```

---

## 📌 Estado del Desarrollo

- [x] **Sprint 1 & 2**: Maquetado semántico, diseño visual responsive, catálogo dinámico, vista de detalle, carrito con persistencia local y validación de formularios.
- [ ] **Próximos Sprints**: Migración progresiva a arquitectura de componentes (React), backend con Node.js/Express y persistencia con MongoDB.

---
