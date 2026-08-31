// Array de datos de productos (puedes reemplazar las rutas de imágenes y datos)
const productos = [
  {
    id: 1,
    nombre: "Aparador Uspallata",
    precio: "$45.000",
    imagen: "assets/products/Aparador Uspallata.png",
    destacado: true
  },
  {
    id: 2,
    nombre: "Biblioteca Recoleta",
    precio: "$38.000",
    imagen: "assets/products/Biblioteca Recoleta.png",
    destacado: true
  },
  {
    id: 3,
    nombre: "Butaca Mendoza",
    precio: "$29.000",
    imagen: "assets/products/Butaca Mendoza.png",
    destacado: true
  },
  {
    id: 4,
    nombre: "Escritorio Costa",
    precio: "$42.000",
    imagen: "assets/products/Escritorio Costa.png",
    destacado: false
  },
  {
    id: 5,
    nombre: "Mesa Comedor Pampa",
    precio: "$29.000",
    imagen: "assets/products/Mesa Comedor Pampa.png",
    destacado: false
  },
  {
    id: 6,
    nombre: "Mesa de Centro Araucaria",
    precio: "$29.000",
    imagen: "assets/products/Mesa de Centro Araucaria.png",
    destacado: false
  },
  {
    id: 7,
    nombre: "Mesa de Noche Aconcagua",
    precio: "$29.000",
    imagen: "assets/products/Mesa de Noche Aconcagua.png",
    destacado: false
  },
  {
    id: 8,
    nombre: "Silla de Trabajo Belgrano",
    precio: "$29.000",
    imagen: "assets/products/Silla de Trabajo Belgrano.png",
    destacado: false
  },
  {
    id: 9,
    nombre: "Sillas Córdoba",
    precio: "$29.000",
    imagen: "assets/products/Sillas Córdoba.png",
    destacado: false
  },
  {
    id: 10,
    nombre: "Sillón Copacabana",
    precio: "$29.000",
    imagen: "assets/products/Sillón Copacabana.png",
    destacado: false
  },
  {
    id: 11,
    nombre: "Sofa Patagonia",
    precio: "$29.000",
    imagen: "assets/products/Sofá Patagonia.png",
    destacado: false
  }

];

// Función para crear el HTML de una tarjeta de producto
function crearTarjetaProducto(producto) {
  return `
    <article class="tarjeta-producto">
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <p class="precio">${producto.precio}</p>
      <button class="btn-comprar" href="carrito.html">Ver detalle</button>
    </article>
  `;
}

// Renderizado según el contenedor presente en la página activa
document.addEventListener("DOMContentLoaded", () => {
  const contenedorDestacados = document.getElementById("contenedor-destacados");
  const contenedorCatalogo = document.getElementById("contenedor-catalogo");

  // Si estamos en index.html (existe el contenedor de destacados)
  if (contenedorDestacados) {
    // Filtrar destacados o tomar únicamente los primeros 3 productos
    const productosDestacados = productos.slice(0, 3); 
    
    contenedorDestacados.innerHTML = productosDestacados
      .map(prod => crearTarjetaProducto(prod))
      .join("");
  }

  // Si estamos en catalogo.html (existe el contenedor del catálogo completo)
  if (contenedorCatalogo) {
    contenedorCatalogo.innerHTML = productos
      .map(prod => crearTarjetaProducto(prod))
      .join("");
  }
});