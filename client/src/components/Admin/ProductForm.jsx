import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = [
  { value: 'living', label: 'Living & Sala' },
  { value: 'comedor', label: 'Comedor' },
  { value: 'dormitorio', label: 'Dormitorio' },
  { value: 'almacenamiento', label: 'Almacenamiento' },
  { value: 'trabajo', label: 'Espacios de Trabajo' },
];

const CATALOG_GALLERY = [
  { name: 'Aparador Uspallata', path: 'assets/products/Aparador Uspallata.png', category: 'almacenamiento' },
  { name: 'Biblioteca Recoleta', path: 'assets/products/Biblioteca Recoleta.png', category: 'almacenamiento' },
  { name: 'Butaca Mendoza', path: 'assets/products/Butaca Mendoza.png', category: 'living' },
  { name: 'Mesa Comedor Pampa', path: 'assets/products/Mesa Comedor Pampa.png', category: 'comedor' },
  { name: 'Sillón Copacabana', path: 'assets/products/Sillón Copacabana.png', category: 'living' },
  { name: 'Escritorio Costa', path: 'assets/products/Escritorio Costa.png', category: 'trabajo' },
  { name: 'Mesa de Centro Araucaria', path: 'assets/products/Mesa de Centro Araucaria.png', category: 'living' },
  { name: 'Mesa de Noche Aconcagua', path: 'assets/products/Mesa de Noche Aconcagua.png', category: 'dormitorio' },
  { name: 'Silla de Trabajo Belgrano', path: 'assets/products/Silla de Trabajo Belgrano.png', category: 'trabajo' },
  { name: 'Sillas Córdoba', path: 'assets/products/Sillas Córdoba.png', category: 'comedor' },
  { name: 'Sofá Patagonia', path: 'assets/products/Sofá Patagonia.png', category: 'living' },
];

const formatPrice = (value) => {
  const num = Number(value);
  if (isNaN(num) || num <= 0) return '$ 0';
  return '$\u00A0' + num.toLocaleString('es-AR');
};

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading: productsLoading, createProduct, updateProduct } = useProducts();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const isEdit = Boolean(id);

  // Modo de selector de imagen: 'gallery' | 'upload' | 'url'
  const [imageSourceTab, setImageSourceTab] = useState('gallery');
  const [localFileName, setLocalFileName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'living',
    price: '',
    stock: '',
    image: '',
    description: '',
    featured: false,
  });

  // Especificaciones base opcionales
  const [specs, setSpecs] = useState({
    medidas: '',
    materiales: '',
    acabado: '',
  });

  // Especificaciones adicionales personalizadas y opcionales
  const [customSpecs, setCustomSpecs] = useState([]);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [productLoaded, setProductLoaded] = useState(!isEdit);
  const [notFound, setNotFound] = useState(false);

  // Cargar datos del producto si estamos en modo edición
  useEffect(() => {
    if (!isEdit) return;

    if (!productsLoading && products.length > 0) {
      const found = products.find(
        (p) => String(p.id ?? p._id) === String(id)
      );

      if (found) {
        setFormData({
          name: found.name || '',
          category: found.category || 'living',
          price: found.price !== undefined ? String(found.price) : '',
          stock: found.stock !== undefined ? String(found.stock) : '0',
          image: found.image || '',
          description: found.description || '',
          featured: Boolean(found.featured),
        });

        // Cargar especificaciones técnicas existentes
        if (found.specs && typeof found.specs === 'object') {
          const { medidas, materiales, acabado, ...rest } = found.specs;
          setSpecs({
            medidas: medidas || '',
            materiales: materiales || '',
            acabado: acabado || '',
          });

          // Cualquier otra especificación específica (ej: peso, capacidad, rotación)
          const customList = Object.entries(rest).map(([key, value], idx) => ({
            id: `spec-${Date.now()}-${idx}`,
            key,
            value: value || '',
          }));
          setCustomSpecs(customList);
        }

        // Si la imagen coincide con la galería, activar la pestaña de galería, si no, URL
        const inGallery = CATALOG_GALLERY.some((item) => item.path === found.image);
        if (inGallery) {
          setImageSourceTab('gallery');
        } else if (found.image?.startsWith('data:image')) {
          setImageSourceTab('upload');
          setLocalFileName('Imagen guardada');
        } else if (found.image) {
          setImageSourceTab('url');
        }

        setProductLoaded(true);
        setNotFound(false);
      } else {
        setProductLoaded(true);
        setNotFound(true);
      }
    }
  }, [isEdit, id, products, productsLoading]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setSpecs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejo de especificaciones personalizadas opcionales
  const handleAddCustomSpec = () => {
    setCustomSpecs((prev) => [
      ...prev,
      { id: `spec-${Date.now()}`, key: '', value: '' },
    ]);
  };

  const handleUpdateCustomSpec = (idToUpdate, field, newValue) => {
    setCustomSpecs((prev) =>
      prev.map((item) =>
        item.id === idToUpdate ? { ...item, [field]: newValue } : item
      )
    );
  };

  const handleRemoveCustomSpec = (idToRemove) => {
    setCustomSpecs((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  // Manejo de imagen desde Galería
  const handleSelectGalleryImage = (imagePath) => {
    setFormData((prev) => ({ ...prev, image: imagePath }));
    if (errors.image) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.image;
        return next;
      });
    }
  };

  // Manejo de subida de imagen local (desde la computadora)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('El archivo seleccionado debe ser una imagen (PNG, JPG, WEBP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setFormData((prev) => ({ ...prev, image: dataUrl }));
      setLocalFileName(file.name);
      addToast(`"${file.name}" cargada desde tus archivos.`, 'info');
      if (errors.image) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.image;
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setLocalFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del mueble es obligatorio.';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!formData.category) {
      newErrors.category = 'Seleccioná una categoría para el mueble.';
    }

    const priceNum = Number(formData.price);
    if (formData.price === '' || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Ingresá un precio válido mayor a 0.';
    }

    const stockNum = Number(formData.stock);
    if (
      formData.stock === '' ||
      isNaN(stockNum) ||
      stockNum < 0 ||
      !Number.isInteger(stockNum)
    ) {
      newErrors.stock = 'El stock debe ser un número entero mayor o igual a 0.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción del mueble es obligatoria.';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      addToast('Por favor corregí los campos requeridos en el formulario.', 'error');
      return;
    }

    setSubmitting(true);

    const priceNum = Number(formData.price);
    const stockNum = Number(formData.stock);
    const trimmedName = formData.name.trim();

    // Construir especificaciones filtrando solo las que el usuario haya completado (opcionales)
    const finalSpecs = {};
    if (specs.medidas.trim()) finalSpecs.medidas = specs.medidas.trim();
    if (specs.materiales.trim()) finalSpecs.materiales = specs.materiales.trim();
    if (specs.acabado.trim()) finalSpecs.acabado = specs.acabado.trim();

    customSpecs.forEach((specItem) => {
      const key = specItem.key.trim().toLowerCase();
      const val = specItem.value.trim();
      if (key && val) {
        finalSpecs[key] = val;
      }
    });

    const payload = {
      name: trimmedName,
      slug: trimmedName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''),
      category: formData.category,
      price: priceNum,
      stock: stockNum,
      image: formData.image.trim() || 'assets/placeholder-furniture.png',
      description: formData.description.trim(),
      featured: Boolean(formData.featured),
      specs: Object.keys(finalSpecs).length > 0 ? finalSpecs : undefined,
    };

    try {
      if (isEdit) {
        await updateProduct(id, payload);
        addToast(`"${payload.name}" fue actualizado con éxito.`, 'success');
      } else {
        await createProduct(payload);
        addToast(`"${payload.name}" fue agregado al catálogo con éxito.`, 'success');
      }
      navigate('/admin');
    } catch (err) {
      addToast(
        err.message || 'No se pudo guardar el producto. Verificá la conexión con la API.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Estado si el producto a editar no existe
  if (isEdit && notFound) {
    return (
      <section className="admin-panel-section" aria-label="Producto no encontrado">
        <div className="container">
          <div className="admin-form-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--negro)', marginBottom: '1rem' }}>
              Mueble no encontrado
            </h2>
            <p style={{ color: 'var(--gris)', marginBottom: '2rem' }}>
              No se encontró ningún producto con el identificador #{id}.
            </p>
            <Link to="/admin" className="btn btn-primary">
              Volver al panel de administración
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Estado de carga inicial mientras se busca el producto
  if (isEdit && !productLoaded) {
    return (
      <section className="admin-panel-section" aria-label="Cargando producto">
        <div className="container">
          <div className="products-loading" data-testid="form-loading">
            <p>Cargando información del mueble #{id}...</p>
          </div>
        </div>
      </section>
    );
  }

  // Helpers para la vista previa en vivo
  const previewStock = Number(formData.stock);
  const hasPreviewStock = !isNaN(previewStock) && formData.stock !== '';
  const isOutOfStock = hasPreviewStock && previewStock === 0;
  const isLowStock = hasPreviewStock && previewStock > 0 && previewStock <= 3;

  const currentCategory = CATEGORIES.find((c) => c.value === formData.category);
  const displayImage = formData.image.trim() || '/assets/placeholder-furniture.png';

  return (
    <section className="admin-panel-section" aria-label={isEdit ? 'Editar Producto' : 'Crear Producto'}>
      <div className="container">
        {/* Breadcrumb de navegación */}
        <nav className="admin-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/admin" className="admin-breadcrumb-link">
            ← Volver a Inventario
          </Link>
          <span className="admin-breadcrumb-separator">/</span>
          <span className="admin-breadcrumb-current">
            {isEdit ? `Editar #${id}` : 'Alta de Producto'}
          </span>
        </nav>

        {/* Encabezado */}
        <header className="admin-header">
          <div className="admin-header-text">
            <span className="admin-badge">
              {isEdit ? 'Modificación de Catálogo' : 'Nuevo Ingreso Artesanal'}
            </span>
            <h1 className="admin-title">
              {isEdit ? `Editar Mueble #${id}` : 'Alta de Nuevo Mueble'}
            </h1>
            <p className="admin-subtitle">
              {isEdit
                ? 'Actualizá los datos técnicos, stock y precios del mueble preservando los estándares de calidad.'
                : 'Completá la ficha técnica para sumar una nueva pieza única al catálogo exclusivo de Hermanos Jota.'}
            </p>
          </div>
        </header>

        {/* Layout en 2 columnas: Formulario a la izquierda, Vista Previa a la derecha */}
        <div className="admin-form-layout">
          {/* Columna Formulario */}
          <div className="admin-form-column">
            <form
              className="admin-form-card"
              onSubmit={handleSubmit}
              noValidate
              id="product-form"
            >
              {/* =========================================================
                  Sección 1: Información Principal
                  ========================================================= */}
              <div className="admin-form-fieldset">
                <h2 className="admin-form-section-title">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 7h-9" />
                    <path d="M14 17H5" />
                    <circle cx="17" cy="17" r="3" />
                    <circle cx="7" cy="7" r="3" />
                  </svg>
                  Datos Principales
                </h2>

                {/* Nombre */}
                <div className="admin-form-group">
                  <label htmlFor="product-name" className="admin-form-label">
                    Nombre del Mueble <span className="admin-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="product-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej: Aparador Uspallata en Nogal"
                    className={`admin-form-input ${errors.name ? 'admin-form-input--error' : ''}`}
                    required
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'error-name' : undefined}
                  />
                  {errors.name && (
                    <span className="admin-form-error-msg" id="error-name" role="alert">
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* Grid 2 columnas: Categoría y Destacado con alineación perfecta */}
                <div className="admin-form-grid-2">
                  {/* Categoría */}
                  <div className="admin-form-group">
                    <label htmlFor="product-category" className="admin-form-label">
                      Categoría <span className="admin-required">*</span>
                    </label>
                    <select
                      id="product-category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`admin-form-select ${errors.category ? 'admin-form-input--error' : ''}`}
                      required
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <span className="admin-form-error-msg" role="alert">
                        {errors.category}
                      </span>
                    )}
                  </div>

                  {/* Destacado con etiqueta propia y altura alineada */}
                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="product-featured">
                      Visibilidad en Portada (Opcional)
                    </label>
                    <label className="admin-form-checkbox-card" htmlFor="product-featured">
                      <input
                        type="checkbox"
                        id="product-featured"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                        className="admin-form-checkbox"
                      />
                      <div className="admin-form-checkbox-text">
                        <strong>★ Destacar pieza</strong>
                        <small>Mostrar en el banner de piezas destacadas</small>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Grid 2 columnas: Precio y Stock */}
                <div className="admin-form-grid-2">
                  {/* Precio */}
                  <div className="admin-form-group">
                    <label htmlFor="product-price" className="admin-form-label">
                      Precio en ARS ($) <span className="admin-required">*</span>
                    </label>
                    <div className="admin-input-prefix-wrapper">
                      <span className="admin-input-prefix">$</span>
                      <input
                        type="number"
                        id="product-price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="Ej: 1890000"
                        min="1"
                        step="1"
                        className={`admin-form-input admin-form-input--prefixed ${
                          errors.price ? 'admin-form-input--error' : ''
                        }`}
                        required
                        aria-invalid={Boolean(errors.price)}
                        aria-describedby={errors.price ? 'error-price' : undefined}
                      />
                    </div>
                    {errors.price && (
                      <span className="admin-form-error-msg" id="error-price" role="alert">
                        {errors.price}
                      </span>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="admin-form-group">
                    <label htmlFor="product-stock" className="admin-form-label">
                      Stock Disponible <span className="admin-required">*</span>
                    </label>
                    <input
                      type="number"
                      id="product-stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="Ej: 5"
                      min="0"
                      step="1"
                      className={`admin-form-input ${errors.stock ? 'admin-form-input--error' : ''}`}
                      required
                      aria-invalid={Boolean(errors.stock)}
                      aria-describedby={errors.stock ? 'error-stock' : undefined}
                    />
                    {errors.stock && (
                      <span className="admin-form-error-msg" id="error-stock" role="alert">
                        {errors.stock}
                      </span>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                <div className="admin-form-group">
                  <label htmlFor="product-description" className="admin-form-label">
                    Descripción Artesanal <span className="admin-required">*</span>
                  </label>
                  <textarea
                    id="product-description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describí los detalles de construcción, el veteado de la madera y el propósito del diseño..."
                    className={`admin-form-textarea ${
                      errors.description ? 'admin-form-input--error' : ''
                    }`}
                    required
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={errors.description ? 'error-description' : undefined}
                  />
                  {errors.description && (
                    <span className="admin-form-error-msg" id="error-description" role="alert">
                      {errors.description}
                    </span>
                  )}
                </div>
              </div>

              {/* =========================================================
                  Sección 2: Fotografía del Mueble (Galería visual + Subida de archivos + URL)
                  ========================================================= */}
              <div className="admin-form-fieldset">
                <h2 className="admin-form-section-title">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Fotografía del Mueble
                </h2>

                {/* Pestañas para elegir la forma de cargar la imagen */}
                <div className="admin-img-tabs" role="tablist" aria-label="Métodos de selección de imagen">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={imageSourceTab === 'gallery'}
                    className={`admin-img-tab-btn ${imageSourceTab === 'gallery' ? 'admin-img-tab-btn--active' : ''}`}
                    onClick={() => setImageSourceTab('gallery')}
                  >
                    🖼️ Galería Visual del Catálogo
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={imageSourceTab === 'upload'}
                    className={`admin-img-tab-btn ${imageSourceTab === 'upload' ? 'admin-img-tab-btn--active' : ''}`}
                    onClick={() => setImageSourceTab('upload')}
                  >
                    📁 Subir desde mi Computadora
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={imageSourceTab === 'url'}
                    className={`admin-img-tab-btn ${imageSourceTab === 'url' ? 'admin-img-tab-btn--active' : ''}`}
                    onClick={() => setImageSourceTab('url')}
                  >
                    🔗 Pegar URL Web
                  </button>
                </div>

                {/* Contenido Pestaña 1: Galería Visual con miniaturas */}
                {imageSourceTab === 'gallery' && (
                  <div className="admin-img-tab-content">
                    <p className="admin-form-hint" style={{ marginBottom: '12px' }}>
                      Elegí una fotografía existente de la colección artesanal de Hermanos Jota con ayuda visual:
                    </p>
                    <div className="admin-gallery-grid" role="group" aria-label="Galería visual de muebles">
                      {CATALOG_GALLERY.map((item) => {
                        const isSelected = formData.image === item.path;
                        return (
                          <button
                            key={item.path}
                            type="button"
                            className={`admin-gallery-card ${isSelected ? 'admin-gallery-card--selected' : ''}`}
                            onClick={() => handleSelectGalleryImage(item.path)}
                            title={`Seleccionar ${item.name}`}
                          >
                            <div className="admin-gallery-thumb-box">
                              <img
                                src={`/${item.path}`}
                                alt={item.name}
                                className="admin-gallery-img"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/assets/placeholder-furniture.png';
                                }}
                              />
                              {isSelected && (
                                <div className="admin-gallery-selected-badge" aria-label="Seleccionado">
                                  ✓
                                </div>
                              )}
                            </div>
                            <span className="admin-gallery-title">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Contenido Pestaña 2: Subir archivo local */}
                {imageSourceTab === 'upload' && (
                  <div className="admin-img-tab-content">
                    <p className="admin-form-hint" style={{ marginBottom: '12px' }}>
                      Seleccioná una imagen desde tu dispositivo (JPG, PNG, WEBP). Se procesará de inmediato para el catálogo:
                    </p>
                    <div
                      className="admin-dropzone"
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="product-file-upload"
                      />
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <strong>Hacé clic acá para elegir una imagen de tus archivos</strong>
                      <span>o arrastrá un archivo PNG, JPG o WEBP</span>
                    </div>

                    {localFileName && (
                      <div className="admin-upload-status">
                        <span className="admin-upload-file-tag">
                          📎 {localFileName}
                        </span>
                        <button
                          type="button"
                          className="admin-upload-clear-btn"
                          onClick={handleClearImage}
                        >
                          Quitar archivo
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Contenido Pestaña 3: Pegar URL */}
                {imageSourceTab === 'url' && (
                  <div className="admin-img-tab-content">
                    <div className="admin-form-group">
                      <label htmlFor="product-image" className="admin-form-label">
                        Ruta relativa o URL de la imagen
                      </label>
                      <input
                        type="text"
                        id="product-image"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="Ej: assets/products/Aparador Uspallata.png o https://..."
                        className="admin-form-input"
                      />
                      <p className="admin-form-hint">
                        Podés ingresar un enlace web directo a la fotografía o una ruta interna del proyecto.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* =========================================================
                  Sección 3: Especificaciones Técnicas (Ficha de Taller - Opcionales)
                  ========================================================= */}
              <div className="admin-form-fieldset">
                <div className="admin-form-section-header">
                  <h2 className="admin-form-section-title">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Especificaciones Técnicas (Ficha de Taller)
                  </h2>
                  <span className="admin-optional-pill">Opcionales</span>
                </div>

                <p className="admin-form-hint" style={{ marginBottom: '16px' }}>
                  Cada tipo de mueble puede tener sus propias características (medidas, peso, rotación, tapizado o capacidad).
                  Completá solo las que apliquen a esta pieza artesanal:
                </p>

                {/* Especificaciones estándar opcionales */}
                <div className="admin-form-grid-3">
                  <div className="admin-form-group">
                    <label htmlFor="product-medidas" className="admin-form-label">
                      Medidas <small className="admin-label-optional">(Opcional)</small>
                    </label>
                    <input
                      type="text"
                      id="product-medidas"
                      name="medidas"
                      value={specs.medidas}
                      onChange={handleSpecChange}
                      placeholder="Ej: 180 × 45 × 75 cm"
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="product-materiales" className="admin-form-label">
                      Materiales <small className="admin-label-optional">(Opcional)</small>
                    </label>
                    <input
                      type="text"
                      id="product-materiales"
                      name="materiales"
                      value={specs.materiales}
                      onChange={handleSpecChange}
                      placeholder="Ej: Nogal macizo FSC®"
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="product-acabado" className="admin-form-label">
                      Acabado <small className="admin-label-optional">(Opcional)</small>
                    </label>
                    <input
                      type="text"
                      id="product-acabado"
                      name="acabado"
                      value={specs.acabado}
                      onChange={handleSpecChange}
                      placeholder="Ej: Aceite natural eco"
                      className="admin-form-input"
                    />
                  </div>
                </div>

                {/* Especificaciones dinámicas adicionales */}
                {customSpecs.length > 0 && (
                  <div className="admin-custom-specs-list">
                    <strong className="admin-custom-specs-heading">
                      Otras Especificaciones Particulares:
                    </strong>
                    {customSpecs.map((item) => (
                      <div key={item.id} className="admin-custom-spec-row">
                        <div className="admin-custom-spec-col">
                          <label className="admin-form-label-sr">Propiedad</label>
                          <input
                            type="text"
                            placeholder="Propiedad (ej: Peso, Rotación, Tapizado)"
                            value={item.key}
                            onChange={(e) =>
                              handleUpdateCustomSpec(item.id, 'key', e.target.value)
                            }
                            className="admin-form-input"
                          />
                        </div>
                        <div className="admin-custom-spec-col">
                          <label className="admin-form-label-sr">Valor</label>
                          <input
                            type="text"
                            placeholder="Valor (ej: 42 kg, 360°, Bouclé Rose)"
                            value={item.value}
                            onChange={(e) =>
                              handleUpdateCustomSpec(item.id, 'value', e.target.value)
                            }
                            className="admin-form-input"
                          />
                        </div>
                        <button
                          type="button"
                          className="admin-spec-remove-btn"
                          onClick={() => handleRemoveCustomSpec(item.id)}
                          title="Eliminar esta especificación"
                          aria-label="Eliminar especificación"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón para añadir una nueva especificación personalizada */}
                <div style={{ marginTop: '14px' }}>
                  <button
                    type="button"
                    className="admin-btn-add-spec"
                    onClick={handleAddCustomSpec}
                  >
                    + Agregar otra especificación personalizada
                  </button>
                </div>
              </div>

              {/* Botones de acción del formulario */}
              <div className="admin-form-actions">
                <Link to="/admin" className="btn btn-secondary admin-btn-cancel">
                  Cancelar
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary admin-btn-submit"
                  disabled={submitting}
                  id="btn-submit-product"
                >
                  {submitting ? (
                    <>
                      <span className="admin-spinner" aria-hidden="true" />
                      <span>Guardando mueble...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      <span>{isEdit ? 'Guardar Cambios' : 'Publicar Mueble'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Columna Lateral: Vista Previa en Tiempo Real */}
          <aside className="admin-preview-column" aria-label="Vista previa en tiempo real">
            <div className="admin-preview-sticky">
              <div className="admin-preview-badge">
                <span className="admin-preview-dot" aria-hidden="true" />
                Vista Previa en Vivo
              </div>

              <div className="admin-preview-card">
                {/* Imagen y badges flotantes */}
                <div className="admin-preview-img-wrapper">
                  <img
                    src={displayImage.startsWith('data:') || displayImage.startsWith('http') || displayImage.startsWith('/') ? displayImage : `/${displayImage}`}
                    alt={formData.name || 'Vista previa del mueble'}
                    className="admin-preview-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/placeholder-furniture.png';
                    }}
                  />
                  {formData.featured && (
                    <span className="admin-preview-featured-tag">
                      ★ Destacado
                    </span>
                  )}
                  {hasPreviewStock && (
                    <span
                      className={`stock-badge admin-preview-stock-badge ${
                        isOutOfStock
                          ? 'stock-badge--out'
                          : isLowStock
                          ? 'stock-badge--low'
                          : 'stock-badge--in'
                      }`}
                    >
                      <span className="stock-indicator-dot" aria-hidden="true">●</span>
                      {isOutOfStock
                        ? 'Sin stock (0)'
                        : isLowStock
                        ? `¡Bajo! (${previewStock})`
                        : `${previewStock} disponibles`}
                    </span>
                  )}
                </div>

                {/* Contenido de la tarjeta */}
                <div className="admin-preview-body">
                  <span className="admin-category-tag admin-preview-category">
                    {currentCategory?.label || 'Categoría'}
                  </span>

                  <h3 className="admin-preview-title">
                    {formData.name.trim() || 'Nombre del Mueble'}
                  </h3>

                  <p className="admin-preview-desc">
                    {formData.description.trim() ||
                      'La descripción de tu pieza artesanal aparecerá aquí tal como la verán tus clientes en el catálogo.'}
                  </p>

                  {/* Ficha técnica compacta en la vista previa (incluye base y personalizadas) */}
                  {(specs.medidas ||
                    specs.materiales ||
                    specs.acabado ||
                    customSpecs.some((c) => c.key && c.value)) && (
                    <div className="admin-preview-specs">
                      {specs.medidas && (
                        <div className="admin-preview-spec-item">
                          <span>Medidas:</span> {specs.medidas}
                        </div>
                      )}
                      {specs.materiales && (
                        <div className="admin-preview-spec-item">
                          <span>Materiales:</span> {specs.materiales}
                        </div>
                      )}
                      {specs.acabado && (
                        <div className="admin-preview-spec-item">
                          <span>Acabado:</span> {specs.acabado}
                        </div>
                      )}
                      {customSpecs.map((item) => {
                        if (!item.key.trim() || !item.value.trim()) return null;
                        return (
                          <div key={item.id} className="admin-preview-spec-item">
                            <span style={{ textTransform: 'capitalize' }}>
                              {item.key}:
                            </span>{' '}
                            {item.value}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="admin-preview-footer">
                    <span className="admin-preview-price-label">Precio Catálogo</span>
                    <strong className="admin-preview-price">
                      {formatPrice(formData.price)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="admin-preview-note">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>
                  Los cambios que realices se sincronizan en vivo con esta tarjeta de presentación.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default ProductForm;
