/* =============================================
   HERMANOS JOTA — INTERACTIVIDAD & LÓGICA
   JavaScript integral para todas las páginas
   ============================================= */

document.addEventListener("DOMContentLoaded", function () {
  // Inicializaciones globales comunes
  initHeader();
  initMobileMenu();
  updateCartBadge();
  initScrollAnimations();
  initHeroVolumeToggle();

  // Inicializaciones según la página activa
  if (document.getElementById("products-grid")) {
    loadFeaturedProducts();
  }

  if (document.getElementById("catalog-grid")) {
    initCatalogPage();
  }

  if (document.getElementById("product-detail-content")) {
    initProductDetailPage();
  }

  if (document.getElementById("cart-container")) {
    initCartPage();
  }

  if (document.getElementById("contact-form")) {
    initContactPage();
  }
});

/* =============================================
   1. SISTEMA DE GESTIÓN DEL CARRITO (localStorage)
   ============================================= */

const Cart = {
  KEY: "hermanos_jota_cart",

  getItems: function () {
    try {
      const items = localStorage.getItem(this.KEY);
      return items ? JSON.parse(items) : [];
    } catch (e) {
      console.error("Error al leer el carrito", e);
      return [];
    }
  },

  saveItems: function (items) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(items));
      updateCartBadge();
    } catch (e) {
      console.error("Error al guardar el carrito", e);
    }
  },

  addItem: function (productId, quantity = 1) {
    const items = this.getItems();
    const existingIndex = items.findIndex((item) => item.id === productId);

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({ id: productId, quantity: quantity });
    }

    this.saveItems(items);
  },

  updateQuantity: function (productId, delta) {
    let items = this.getItems();
    const item = items.find((i) => i.id === productId);

    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        items = items.filter((i) => i.id !== productId);
      }
      this.saveItems(items);
    }
    return items;
  },

  removeItem: function (productId) {
    let items = this.getItems();
    items = items.filter((i) => i.id !== productId);
    this.saveItems(items);
    return items;
  },

  getTotalCount: function () {
    const items = this.getItems();
    return items.reduce((total, item) => total + item.quantity, 0);
  },

  clear: function () {
    localStorage.removeItem(this.KEY);
    updateCartBadge();
  },
};

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (badge) {
    badge.textContent = Cart.getTotalCount();
  }
}

/* =============================================
   2. COMPONENTES GLOBALES (Header & Navegación)
   ============================================= */

function initHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;

  // Si no hay hero (ej. páginas internas), siempre es sólido
  const hasHero = document.querySelector(".hero");
  if (!hasHero) {
    header.classList.add("scrolled");
    return;
  }

  const scrollThreshold = 60;

  function handleScroll() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
}

function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    const isOpen = toggle.classList.toggle("open");
    nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"
    );
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  nav.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      toggle.classList.remove("open");
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menú de navegación");
      document.body.style.overflow = "";
    });
  });
}

function initScrollAnimations() {
  const elements = document.querySelectorAll(".fade-in");
  if (!elements.length) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  elements.forEach((el) => observer.observe(el));
}

/* =============================================
   3. PÁGINA PRINCIPAL: Productos Destacados
   ============================================= */

function loadFeaturedProducts() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  if (typeof fetchFeaturedProducts !== "function") {
    grid.innerHTML =
      '<p class="products-loading">No se pudieron cargar los productos.</p>';
    return;
  }

  fetchFeaturedProducts().then(function (products) {
    grid.innerHTML = "";

    products.forEach(function (product, index) {
      const card = createProductCard(product, index);
      grid.appendChild(card);
    });

    initScrollAnimations();
  });
}

function getCategoryLabel(category) {
  const categoryLabels = {
    living: "Living",
    comedor: "Comedor",
    dormitorio: "Dormitorio",
    almacenamiento: "Almacenamiento",
    trabajo: "Espacio de trabajo",
  };
  return categoryLabels[category] || category;
}

function createProductCard(product, index) {
  const card = document.createElement("article");
  card.className =
    "product-card fade-in fade-in-delay-" + ((index % 4) + 1);
  card.id = "product-card-" + product.id;

  const categoryLabel = getCategoryLabel(product.category);

  card.innerHTML = `
    <a href="producto.html?id=${product.id}" class="product-card-image">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
    </a>
    <div class="product-card-body">
      <span class="product-card-category">${categoryLabel}</span>
      <h3 class="product-card-name">${product.name}</h3>
      <p class="product-card-description">${product.description}</p>
      <div class="product-card-footer">
        <span class="product-card-price">${formatPrice(product.price)}</span>
        <a href="producto.html?id=${product.id}" class="product-card-link">
          Ver detalle
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
          </svg>
        </a>
      </div>
    </div>
  `;

  return card;
}

/* =============================================
   4. PÁGINA CATÁLOGO (productos.html)
   ============================================= */

function initCatalogPage() {
  const grid = document.getElementById("catalog-grid");
  const searchInput = document.getElementById("catalog-search");
  const filterBtns = document.querySelectorAll(".filter-btn");

  let allProducts = [];
  let currentFilter = "todos";
  let searchQuery = "";

  function renderFiltered() {
    grid.innerHTML = "";

    const filtered = allProducts.filter(function (prod) {
      const matchCategory =
        currentFilter === "todos" || prod.category === currentFilter;
      const matchSearch =
        !searchQuery ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="catalog-empty">
          <p>No se encontraron productos que coincidan con tu búsqueda.</p>
          <button class="btn btn-secondary" id="btn-reset-filters">Limpiar filtros</button>
        </div>
      `;
      const resetBtn = document.getElementById("btn-reset-filters");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          if (searchInput) searchInput.value = "";
          searchQuery = "";
          currentFilter = "todos";
          filterBtns.forEach((b) => b.classList.remove("active"));
          const btnTodos = document.querySelector('[data-filter="todos"]');
          if (btnTodos) btnTodos.classList.add("active");
          renderFiltered();
        });
      }
      return;
    }

    filtered.forEach(function (product, index) {
      const card = createProductCard(product, index);
      grid.appendChild(card);
    });

    initScrollAnimations();
  }

  fetchProducts().then(function (products) {
    allProducts = products;
    renderFiltered();
  });

  // Eventos de búsqueda
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      searchQuery = e.target.value.trim();
      renderFiltered();
    });
  }

  // Eventos de filtrado
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.getAttribute("data-filter");
      renderFiltered();
    });
  });
}

/* =============================================
   5. PÁGINA DETALLE DE PRODUCTO (producto.html)
   ============================================= */

function initProductDetailPage() {
  const container = document.getElementById("product-detail-content");
  const breadcrumbName = document.getElementById("breadcrumb-name");
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get("id"), 10);

  if (isNaN(productId)) {
    renderProductNotFound(container, "No se especificó un producto válido.");
    return;
  }

  fetchProducts().then(function (products) {
    const product = products.find((p) => p.id === productId);

    if (!product) {
      renderProductNotFound(container, "El producto solicitado no existe.");
      return;
    }

    // Actualizar título y breadcrumb
    document.title = `${product.name} — Hermanos Jota`;
    if (breadcrumbName) {
      breadcrumbName.textContent = product.name;
    }

    // Generar tabla de especificaciones
    let specsHtml = "";
    if (product.specs) {
      specsHtml = `
        <div class="product-specs">
          <h3>Detalles de Fabricación</h3>
          <table class="specs-table">
            <tbody>
              ${Object.entries(product.specs)
          .map(
            ([key, val]) => `
                <tr>
                  <td>${key}</td>
                  <td>${val}</td>
                </tr>
              `
          )
          .join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="product-gallery">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <span class="product-card-category">${getCategoryLabel(product.category)}</span>
        <h1>${product.name}</h1>
        <p class="product-description">${product.description}</p>
        <span class="product-price-tag">${formatPrice(product.price)}</span>
        
        <div class="product-actions">
          <button class="btn btn-primary" id="btn-add-cart">Añadir al Carrito</button>
          <a href="productos.html" class="btn btn-secondary">Seguir mirando</a>
        </div>

        <div id="add-to-cart-feedback" style="display:none; color: var(--salvia-dark); font-weight: 500; margin-top: 0.5rem;">
          ✓ ¡Producto añadido al carrito con éxito!
        </div>

        ${specsHtml}
      </div>
    `;

    // Evento Añadir al Carrito
    const addBtn = document.getElementById("btn-add-cart");
    const feedback = document.getElementById("add-to-cart-feedback");

    if (addBtn) {
      addBtn.addEventListener("click", function () {
        Cart.addItem(product.id, 1);
        if (feedback) {
          feedback.style.display = "block";
          setTimeout(() => {
            feedback.style.display = "none";
          }, 3000);
        }
      });
    }
  });
}

function renderProductNotFound(container, message) {
  container.innerHTML = `
    <div class="catalog-empty" style="grid-column: 1 / -1;">
      <h2>Producto no encontrado</h2>
      <p>${message}</p>
      <a href="productos.html" class="btn btn-primary" style="margin-top: 1rem;">Ver catálogo de productos</a>
    </div>
  `;
}

/* =============================================
   6. PÁGINA CARRITO (carrito.html)
   ============================================= */

function initCartPage() {
  const container = document.getElementById("cart-container");
  const subtitle = document.getElementById("cart-subtitle");
  if (!container) return;

  fetchProducts().then(function (products) {
    renderCart(products, container, subtitle);
  });
}

function renderCart(products, container, subtitle) {
  const cartItems = Cart.getItems();

  if (cartItems.length === 0) {
    if (subtitle) subtitle.textContent = "Tu carrito está actualmente vacío";
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛋️</div>
        <h2>Aún no agregaste piezas a tu carrito</h2>
        <p>Explorá nuestro catálogo de muebles artesanales y encontrá la pieza ideal para tu hogar.</p>
        <a href="productos.html" class="btn btn-primary">Explorar catálogo</a>
      </div>
    `;
    return;
  }

  if (subtitle) subtitle.textContent = "Revisá tus productos antes de continuar";

  // Calcular productos y subtotales
  let subtotal = 0;
  const itemsWithDetails = cartItems
    .map((item) => {
      const prod = products.find((p) => p.id === item.id);
      if (!prod) return null;
      const totalItem = prod.price * item.quantity;
      subtotal += totalItem;
      return { ...prod, quantity: item.quantity, totalItem: totalItem };
    })
    .filter(Boolean);

  container.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items">
        ${itemsWithDetails
      .map(
        (item) => `
          <article class="cart-item" id="cart-item-${item.id}">
            <div class="cart-item-image">
              <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
              <h3>${item.name}</h3>
              <span class="cart-item-price">${formatPrice(item.price)}</span>
            </div>
            <div class="cart-item-actions">
              <div class="qty-control">
                <button class="qty-btn btn-qty-minus" data-id="${item.id}" aria-label="Disminuir cantidad">-</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn btn-qty-plus" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
              </div>
              <button class="cart-remove-btn" data-id="${item.id}">Eliminar</button>
            </div>
          </article>
        `
      )
      .join("")}
      </div>

      <aside class="cart-summary">
        <h3>Resumen del Pedido</h3>
        <div class="cart-summary-row">
          <span>Subtotal</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <div class="cart-summary-row">
          <span>Envío (CABA y GBA)</span>
          <span style="color: var(--salvia-dark); font-weight: 500;">Gratis</span>
        </div>
        <div class="cart-summary-total">
          <span>Total</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <button class="btn btn-primary" id="btn-checkout">Iniciar compra</button>
        <button class="btn btn-secondary" id="btn-clear-cart" style="margin-top: 0.5rem; width: 100%;">Vaciar carrito</button>
      </aside>
    </div>
  `;

  // Eventos de botones
  container.querySelectorAll(".btn-qty-plus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"), 10);
      Cart.updateQuantity(id, 1);
      renderCart(products, container, subtitle);
    });
  });

  container.querySelectorAll(".btn-qty-minus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"), 10);
      Cart.updateQuantity(id, -1);
      renderCart(products, container, subtitle);
    });
  });

  container.querySelectorAll(".cart-remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"), 10);
      Cart.removeItem(id);
      renderCart(products, container, subtitle);
    });
  });

  const clearBtn = document.getElementById("btn-clear-cart");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("¿Estás seguro de que deseás vaciar el carrito?")) {
        Cart.clear();
        renderCart(products, container, subtitle);
      }
    });
  }

  const checkoutBtn = document.getElementById("btn-checkout");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      alert("¡Gracias por tu interés! Esta es una simulación de compra para el Sprint 1–2.");
    });
  }
}

/* =============================================
   7. PÁGINA CONTACTO (contacto.html)
   ============================================= */

function initContactPage() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();
    const feedback = document.getElementById("form-feedback");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !subject || !message) {
      showFormFeedback(feedback, "Por favor completá todos los campos requeridos.", true);
      return;
    }

    if (!emailPattern.test(email)) {
      showFormFeedback(feedback, "Ingresá un email válido para poder responderte.", true);
      form.email.focus();
      return;
    }

    const submitBtn = document.getElementById("contact-submit");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
    }

    setTimeout(() => {
      showFormFeedback(
        feedback,
        `¡Gracias ${name}! Recibimos tu consulta. Te responderemos a la brevedad.`,
        false
      );
      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar mensaje";
      }
    }, 600);
  });
}

/* =============================================
   8. CONTROL DE AUDIO HERO (index.html)
   ============================================= */

function initHeroVolumeToggle() {
  const toggleBtn = document.getElementById("video-volume-toggle");
  const heroVideo = document.querySelector(".hero-video");
  const heroSection = document.getElementById("hero");

  if (!toggleBtn || !heroVideo || !heroSection) return;

  // Preferencia del usuario sobre el sonido (por defecto desactivado para no forzar audio)
  let userWantsSound = false;

  function updateUI(isUnmuted) {
    if (isUnmuted && !heroVideo.muted) {
      toggleBtn.classList.add("is-unmuted");
      toggleBtn.setAttribute("aria-label", "Silenciar sonido del video");
      toggleBtn.setAttribute("aria-pressed", "true");
    } else {
      toggleBtn.classList.remove("is-unmuted");
      toggleBtn.setAttribute("aria-label", "Activar sonido del video");
      toggleBtn.setAttribute("aria-pressed", "false");
    }
  }

  // 1. Iniciar con el video silenciado por defecto
  heroVideo.muted = true;
  updateUI(false);
  heroVideo.play().catch(() => { });

  // 2. Control manual con el botón de volumen
  toggleBtn.addEventListener("click", function () {
    if (heroVideo.muted) {
      userWantsSound = true;
      heroVideo.muted = false;
      heroVideo.play().then(() => {
        updateUI(true);
      }).catch((err) => {
        console.log("Error al reproducir audio:", err);
      });
    } else {
      userWantsSound = false;
      heroVideo.muted = true;
      updateUI(false);
    }
  });

  // 3. Control por Scroll (IntersectionObserver)
  // Al salir del Hero el video sigue pero se mutea; al volver se restaura el sonido si el usuario lo desea.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // El usuario regresó al Hero
            if (userWantsSound) {
              heroVideo.muted = false;
              heroVideo.play().catch(() => { });
              updateUI(true);
            }
          } else {
            // El usuario scrolleó fuera del Hero (muteamos sin pausar)
            heroVideo.muted = true;
            updateUI(false);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(heroSection);
  }
}


function showFormFeedback(element, message, isError) {
  if (!element) return;
  element.textContent = message;
  element.className = `form-feedback${isError ? " form-feedback-error" : " form-feedback-success"}`;
}
