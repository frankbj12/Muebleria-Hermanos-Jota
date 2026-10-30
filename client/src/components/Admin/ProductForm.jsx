import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';
import { useToast } from '../../context/ToastContext';
import { getProductImageUrl, FALLBACK_PRODUCT_IMAGE } from '../../utils/imageUrl';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const CATEGORIES = [
  { value: 'living', label: 'Living & Sala' },
  { value: 'comedor', label: 'Comedor' },
  { value: 'dormitorio', label: 'Dormitorio' },
  { value: 'almacenamiento', label: 'Almacenamiento' },
  { value: 'trabajo', label: 'Espacios de Trabajo' },
];

const CATALOG_GALLERY = [
  {
    name: 'Aparador Uspallata',
    path: 'assets/products/Aparador Uspallata.png',
    category: 'almacenamiento',
  },
  {
    name: 'Biblioteca Recoleta',
    path: 'assets/products/Biblioteca Recoleta.png',
    category: 'almacenamiento',
  },
  {
    name: 'Butaca Mendoza',
    path: 'assets/products/Butaca Mendoza.png',
    category: 'living',
  },
  {
    name: 'Mesa Comedor Pampa',
    path: 'assets/products/Mesa Comedor Pampa.png',
    category: 'comedor',
  },
  {
    name: 'Sillón Copacabana',
    path: 'assets/products/Sillón Copacabana.png',
    category: 'living',
  },
  {
    name: 'Escritorio Costa',
    path: 'assets/products/Escritorio Costa.png',
    category: 'trabajo',
  },
  {
    name: 'Mesa de Centro Araucaria',
    path: 'assets/products/Mesa de Centro Araucaria.png',
    category: 'living',
  },
  {
    name: 'Mesa de Noche Aconcagua',
    path: 'assets/products/Mesa de Noche Aconcagua.png',
    category: 'dormitorio',
  },
  {
    name: 'Silla de Trabajo Belgrano',
    path: 'assets/products/Silla de Trabajo Belgrano.png',
    category: 'trabajo',
  },
  {
    name: 'Sillas Córdoba',
    path: 'assets/products/Sillas Córdoba.png',
    category: 'comedor',
  },
  {
    name: 'Sofá Patagonia',
    path: 'assets/products/Sofá Patagonia.png',
    category: 'living',
  },
];

const formatPrice = (value) => {
  const num = Number(value);
  if (isNaN(num) || num <= 0) return '$ 0';
  return '$\u00A0' + num.toLocaleString('es-AR');
};

/**
 * Normaliza y formatea el objeto specs para mantener consistencia
 * con el catálogo PRODUCTS de Hermanos Jota.
 *
 * @param {Object} formData Datos de especificaciones (ancho, prof, alto, materiales, acabado, peso, customSpecs)
 * @returns {Object} specs normalizado
 */
export function formatSpecs(formData = {}) {
  const {
    ancho = '',
    prof = '',
    alto = '',
    materiales = '',
    acabado = '',
    peso = '',
    customSpecs = [],
  } = formData;

  const specs = {};

  // 1. Medidas compuestas (Ancho × Profundidad × Alto cm)
  if (ancho && prof && alto) {
    const clean = (val) => val.toString().trim().replace(/cm/gi, '').trim();
    specs.medidas = `${clean(ancho)} × ${clean(prof)} × ${clean(alto)} cm`;
  }

  // 2. Campos fijos
  if (materiales && materiales.toString().trim()) {
    specs.materiales = materiales.toString().trim();
  }
  if (acabado && acabado.toString().trim()) {
    specs.acabado = acabado.toString().trim();
  }

  // 3. Sufijo automático para métricas
  if (peso && peso.toString().trim()) {
    const numPeso = peso.toString().replace(/kg/gi, '').trim();
    specs.peso = `${numPeso} kg`;
  }

  // 4. Especificaciones dinámicas adicionales
  if (Array.isArray(customSpecs)) {
    customSpecs.forEach((item) => {
      const c = item.clave || item.key;
      const v = item.valor || item.value;
      if (c && v && v.toString().trim()) {
        const k = c.trim().toLowerCase();
        if (k === 'peso') {
          const num = v.toString().replace(/kg/gi, '').trim();
          specs.peso = `${num} kg`;
        } else {
          specs[k] = v.toString().trim();
        }
      }
    });
  }

  return specs;
}

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    products,
    loading: productsLoading,
    createProduct,
    updateProduct,
  } = useProducts();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const isEdit = Boolean(id);

  // Modo de selector de imagen: 'gallery' | 'upload' | 'url'
  const [imageSourceTab, setImageSourceTab] = useState('gallery');
  const [localFileName, setLocalFileName] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Imágenes alojadas en Vercel Blob
  const [blobImages, setBlobImages] = useState([]);
  const [loadingBlobs, setLoadingBlobs] = useState(false);
  const [blobToDelete, setBlobToDelete] = useState(null);
  const [isDeletingBlob, setIsDeletingBlob] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'living',
    price: '',
    stock: '0', // Por defecto 0 (sin stock)
    image: '',
    description: '',
    featured: false,
  });

  // Especificaciones base opcionales (Ancho, Profundidad, Alto, Materiales, Acabado)
  const [specs, setSpecs] = useState({
    ancho: '',
    prof: '',
    alto: '',
    materiales: '',
    acabado: '',
  });

  // Especificaciones adicionales personalizadas y opcionales
  const [customSpecs, setCustomSpecs] = useState([]);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [productLoaded, setProductLoaded] = useState(!isEdit);
  const [notFound, setNotFound] = useState(false);

  // Control de Pasos del Wizard (Paso 1: Datos Principales, Paso 2: Fotografía, Paso 3: Ficha Técnica)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleNextStep = () => {
    if (currentStep === 1) {
      const stepErrors = {};
      if (!formData.name.trim()) {
        stepErrors.name = 'El nombre del mueble es obligatorio.';
      } else if (formData.name.trim().length < 3) {
        stepErrors.name = 'El nombre debe tener al menos 3 caracteres.';
      }
      if (!formData.category) {
        stepErrors.category = 'Seleccioná una categoría para el mueble.';
      }
      const priceNum = Number(formData.price);
      if (formData.price === '' || isNaN(priceNum) || priceNum <= 0) {
        stepErrors.price = 'Ingresá un precio válido mayor a 0.';
      }

      // Stock es opcional (por defecto 0): solo validamos si ingresó algo inválido
      if (formData.stock !== '') {
        const stockNum = Number(formData.stock);
        if (
          isNaN(stockNum) ||
          stockNum < 0 ||
          !Number.isInteger(stockNum)
        ) {
          stepErrors.stock =
            'El stock debe ser un número entero mayor o igual a 0.';
        }
      }

      // Descripción es opcional

      if (Object.keys(stepErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...stepErrors }));
        addToast('Completá los campos requeridos antes de avanzar.', 'warning');
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      setCurrentStep(stepNumber);
    }
  };

  // Cargar lista de imágenes de Vercel Blob
  const fetchBlobImages = async () => {
    setLoadingBlobs(true);
    try {
      const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const cleanApiUrl = rawApiUrl.replace(/\/$/, '');
      const res = await fetch(`${cleanApiUrl}/api/upload`);
      if (res.ok) {
        const data = await res.json();
        setBlobImages(data.blobs || []);
      }
    } catch (err) {
      console.error('Error al cargar imágenes de Vercel Blob:', err);
    } finally {
      setLoadingBlobs(false);
    }
  };

  useEffect(() => {
    fetchBlobImages();
  }, []);

  // Cargar datos del producto si estamos en modo edición
  useEffect(() => {
    if (!isEdit) return;

    if (!productsLoading && products.length > 0) {
      const found = products.find((p) => String(p.id ?? p._id) === String(id));

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

          let ancho = '';
          let prof = '';
          let alto = '';

          if (medidas) {
            const cleanMedidas = medidas.replace(/cm/gi, '').trim();
            const parts = cleanMedidas.split(/\s*[×xX]\s*/);
            if (parts.length >= 3) {
              ancho = parts[0]?.trim() || '';
              prof = parts[1]?.trim() || '';
              alto = parts[2]?.trim() || '';
            } else if (parts.length === 1) {
              ancho = parts[0]?.trim() || '';
            }
          }

          setSpecs({
            ancho,
            prof,
            alto,
            materiales: materiales || '',
            acabado: acabado || '',
          });

          // Cargar especificaciones secundarias (peso, capacidad, rotación, tapizado, o personalizadas)
          const customList = Object.entries(rest).map(([key, value], idx) => {
            const lowerKey = key.toLowerCase();
            let tipo = 'otro';
            let clave = key;
            let val = value !== undefined ? String(value) : '';

            if (lowerKey === 'peso') {
              tipo = 'peso';
              clave = 'peso';
              val = val.replace(/kg/gi, '').trim();
            } else if (lowerKey === 'capacidad') {
              tipo = 'capacidad';
              clave = 'capacidad';
            } else if (lowerKey === 'tapizado') {
              tipo = 'tapizado';
              clave = 'tapizado';
            } else if (lowerKey === 'rotacion' || lowerKey === 'rotación') {
              tipo = 'rotacion';
              clave = key;
            }

            return {
              id: `spec-${Date.now()}-${idx}`,
              tipo,
              clave,
              key: clave,
              valor: val,
              value: val,
            };
          });
          setCustomSpecs(customList);
        }

        // Si la imagen coincide con la galería, activar la pestaña de galería, si no, URL
        const inGallery = CATALOG_GALLERY.some(
          (item) => item.path === found.image
        );
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
    if (errors.medidas && ['ancho', 'prof', 'alto'].includes(name)) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.medidas;
        return next;
      });
    }
  };

  // Manejo de especificaciones secundarias y dinámicas
  const handleAddCustomSpec = () => {
    setCustomSpecs((prev) => [
      ...prev,
      {
        id: `spec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        tipo: 'peso',
        clave: 'peso',
        key: 'peso',
        valor: '',
        value: '',
      },
    ]);
  };

  const handleSpecTypeChange = (idToUpdate, newTipo) => {
    setCustomSpecs((prev) =>
      prev.map((item) => {
        if (item.id !== idToUpdate) return item;
        const isOtro = newTipo === 'otro';
        const clave = isOtro ? '' : newTipo;
        return {
          ...item,
          tipo: newTipo,
          clave,
          key: clave,
        };
      })
    );
    if (errors.customSpecs) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.customSpecs;
        return next;
      });
    }
  };

  const handleUpdateCustomSpec = (idToUpdate, field, newValue) => {
    setCustomSpecs((prev) =>
      prev.map((item) => {
        if (item.id !== idToUpdate) return item;
        const updated = { ...item, [field]: newValue };
        if (field === 'clave' || field === 'key') {
          updated.clave = newValue;
          updated.key = newValue;
        }
        if (field === 'valor' || field === 'value') {
          updated.valor = newValue;
          updated.value = newValue;
        }
        return updated;
      })
    );
    if (errors.customSpecs) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.customSpecs;
        return next;
      });
    }
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

  // Procesa y sube una imagen a Vercel Blob (por click en input o por arrastrar y soltar)
  const processImageFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast(
        'El archivo seleccionado debe ser una imagen (PNG, JPG, WEBP).',
        'error'
      );
      return;
    }

    // Vista previa inmediata con URL local de objeto
    const localPreview = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, image: localPreview }));
    setLocalFileName(file.name);
    setUploadingImage(true);
    addToast(`Subiendo "${file.name}" a la nube...`, 'info');

    try {
      const uploadData = new FormData();
      uploadData.append('image', file);

      const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const cleanApiUrl = rawApiUrl.replace(/\/$/, '');

      const response = await fetch(`${cleanApiUrl}/api/upload`, {
        method: 'POST',
        body: uploadData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Error al procesar la subida de la imagen.'
        );
      }

      const data = await response.json();

      // Guardamos la URL pública definitiva de Vercel Blob
      setFormData((prev) => ({ ...prev, image: data.url }));
      addToast(`"${file.name}" subida exitosamente a la nube.`, 'success');

      // Actualizar la lista de imágenes de Vercel Blob
      fetchBlobImages();

      if (errors.image) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.image;
          return next;
        });
      }
    } catch (err) {
      addToast(
        err.message || 'No se pudo subir la imagen al servidor.',
        'error'
      );
      setFormData((prev) => ({ ...prev, image: '' }));
      setLocalFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  // Manejo de Drag and Drop para subir imágenes arrastrando desde la computadora
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleClearImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setLocalFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper para obtener nombre limpio de archivo Blob
  const getBlobName = (blob) => {
    if (!blob || !blob.pathname) return 'imagen';
    return blob.pathname.replace(/^products\//, '').replace(/^\d+-/, '');
  };

  // Confirmar eliminación de una imagen de Vercel Blob
  const handleConfirmDeleteBlob = async () => {
    if (!blobToDelete) return;
    setIsDeletingBlob(true);
    try {
      const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const cleanApiUrl = rawApiUrl.replace(/\/$/, '');
      const response = await fetch(`${cleanApiUrl}/api/upload`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: blobToDelete.url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Error al eliminar la imagen de Vercel Blob.'
        );
      }

      setBlobImages((prev) => prev.filter((b) => b.url !== blobToDelete.url));

      if (formData.image === blobToDelete.url) {
        setFormData((prev) => ({ ...prev, image: '' }));
        setLocalFileName('');
      }

      addToast('Imagen eliminada permanentemente de Vercel Blob.', 'info');
      setBlobToDelete(null);
    } catch (err) {
      addToast(err.message || 'No se pudo eliminar la imagen.', 'error');
    } finally {
      setIsDeletingBlob(false);
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

    // Stock es opcional (por defecto 0): solo validamos si ingresó algo inválido
    if (formData.stock !== '') {
      const stockNum = Number(formData.stock);
      if (
        isNaN(stockNum) ||
        stockNum < 0 ||
        !Number.isInteger(stockNum)
      ) {
        newErrors.stock = 'El stock debe ser un número entero mayor o igual a 0.';
      }
    }

    // Descripción es opcional

    // Validación de medidas: si ingresó alguna medida, deben completarse ancho, profundidad y alto
    const hasAnyDim = Boolean(
      specs.ancho?.trim() || specs.prof?.trim() || specs.alto?.trim()
    );
    const hasAllDims = Boolean(
      specs.ancho?.trim() && specs.prof?.trim() && specs.alto?.trim()
    );
    if (hasAnyDim && !hasAllDims) {
      newErrors.medidas =
        'Completá los tres valores de medidas (ancho, profundidad y alto) o dejalos vacíos.';
    }

    // Validación de especificaciones secundarias: si eligió 'otro' y puso valor pero no nombre
    const hasIncompleteOther = customSpecs.some(
      (c) =>
        (c.tipo === 'otro' || (!c.tipo && c.key)) &&
        !(c.clave || c.key)?.trim() &&
        (c.valor || c.value)?.trim()
    );
    if (hasIncompleteOther) {
      newErrors.customSpecs =
        'Completá el nombre de la propiedad en la especificación personalizada.';
    }

    if (
      newErrors.name ||
      newErrors.category ||
      newErrors.price ||
      newErrors.stock
    ) {
      setCurrentStep(1);
    } else if (newErrors.medidas || newErrors.customSpecs) {
      setCurrentStep(3);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      addToast(
        'Por favor corregí los campos requeridos en el formulario.',
        'error'
      );
      return;
    }

    setSubmitting(true);

    const priceNum = Number(formData.price);
    const stockParsed = formData.stock === '' ? 0 : Number(formData.stock);
    const stockNum = isNaN(stockParsed) || stockParsed < 0 ? 0 : stockParsed;
    const trimmedName = formData.name.trim();

    // Construir especificaciones normalizadas usando el helper formatSpecs
    const finalSpecs = formatSpecs({
      ancho: specs.ancho,
      prof: specs.prof,
      alto: specs.alto,
      materiales: specs.materiales,
      acabado: specs.acabado,
      customSpecs,
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
      image:
        (formData.image || '').trim() ||
        'assets/products/Imagen Mantenimiento.png',
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
        addToast(
          `"${payload.name}" fue agregado al catálogo con éxito.`,
          'success'
        );
      }
      navigate('/admin');
    } catch (err) {
      addToast(
        err.message ||
          'No se pudo guardar el producto. Verificá la conexión con la API.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Estado si el producto a editar no existe
  if (isEdit && notFound) {
    return (
      <section
        className="admin-panel-section"
        aria-label="Producto no encontrado"
      >
        <div className="container">
          <div
            className="admin-form-card"
            style={{ textAlign: 'center', padding: '3rem 1.5rem' }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--negro)',
                marginBottom: '1rem',
              }}
            >
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

  return (
    <section
      className="admin-panel-section"
      aria-label={isEdit ? 'Editar Producto' : 'Crear Producto'}
    >
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
                  STEPPER NAV: Barra de Progreso de 3 Pasos
                  ========================================================= */}
              <nav className="admin-wizard-nav" aria-label="Progreso de creación">
                <ol className="admin-wizard-steps-list">
                  <div className="admin-wizard-track" aria-hidden="true" />
                  <div
                    className="admin-wizard-track-fill"
                    aria-hidden="true"
                    style={{
                      width:
                        currentStep === 1
                          ? '0%'
                          : currentStep === 2
                            ? '50%'
                            : '100%',
                    }}
                  />

                  {/* Paso 1 */}
                  <li
                    className="admin-wizard-step-item"
                    onClick={() => goToStep(1)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && goToStep(1)}
                  >
                    <div
                      className={`admin-wizard-badge ${
                        currentStep === 1
                          ? 'admin-wizard-badge--active'
                          : currentStep > 1
                            ? 'admin-wizard-badge--completed'
                            : ''
                      }`}
                    >
                      {currentStep > 1 ? '✓' : '1'}
                    </div>
                    <span
                      className={`admin-wizard-step-label ${
                        currentStep === 1
                          ? 'admin-wizard-step-label--active'
                          : currentStep > 1
                            ? 'admin-wizard-step-label--completed'
                            : ''
                      }`}
                    >
                      Datos Principales
                    </span>
                  </li>

                  {/* Paso 2 */}
                  <li
                    className="admin-wizard-step-item"
                    onClick={() => goToStep(2)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && goToStep(2)}
                  >
                    <div
                      className={`admin-wizard-badge ${
                        currentStep === 2
                          ? 'admin-wizard-badge--active'
                          : currentStep > 2
                            ? 'admin-wizard-badge--completed'
                            : ''
                      }`}
                    >
                      {currentStep > 2 ? '✓' : '2'}
                    </div>
                    <span
                      className={`admin-wizard-step-label ${
                        currentStep === 2
                          ? 'admin-wizard-step-label--active'
                          : currentStep > 2
                            ? 'admin-wizard-step-label--completed'
                            : ''
                      }`}
                    >
                      Fotografía
                    </span>
                  </li>

                  {/* Paso 3 */}
                  <li
                    className="admin-wizard-step-item"
                    onClick={() => goToStep(3)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && goToStep(3)}
                  >
                    <div
                      className={`admin-wizard-badge ${
                        currentStep === 3 ? 'admin-wizard-badge--active' : ''
                      }`}
                    >
                      3
                    </div>
                    <span
                      className={`admin-wizard-step-label ${
                        currentStep === 3
                          ? 'admin-wizard-step-label--active'
                          : ''
                      }`}
                    >
                      Ficha Técnica
                    </span>
                  </li>
                </ol>
              </nav>

              {/* =========================================================
                  PASO 1: Datos Principales (Identidad de la Pieza)
                  ========================================================= */}
              <div
                className={`admin-step-content ${currentStep === 1 ? 'admin-step-content--active' : ''}`}
                id="step-1"
              >
                <div className="admin-step-header">
                  <div className="admin-step-header-icon" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 7h-9" />
                      <path d="M14 17H5" />
                      <circle cx="17" cy="17" r="3" />
                      <circle cx="7" cy="7" r="3" />
                    </svg>
                  </div>
                  <div className="admin-step-header-text">
                    <h2
                      className="admin-form-section-title"
                      style={{ margin: 0, padding: 0, border: 'none' }}
                    >
                      Identidad de la Pieza (Datos Principales)
                    </h2>
                    <p>
                      Definí el nombre comercial, categoría, visibilidad, precio
                      y stock en el catálogo.
                    </p>
                  </div>
                </div>

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
                    placeholder="Ej: Aparador Urquiza en Nogal Macizo"
                    className={`admin-form-input ${errors.name ? 'admin-form-input--error' : ''}`}
                    required
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'error-name' : undefined}
                  />
                  {errors.name && (
                    <span
                      className="admin-form-error-msg"
                      id="error-name"
                      role="alert"
                    >
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* Grid 2 columnas: Categoría y Destacado con alineación perfecta */}
                <div className="admin-form-grid-2">
                  {/* Categoría */}
                  <div className="admin-form-group">
                    <label
                      htmlFor="product-category"
                      className="admin-form-label"
                    >
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
                    <label
                      className="admin-form-label"
                      htmlFor="product-featured"
                    >
                      Visibilidad en Portada (Opcional)
                    </label>
                    <label
                      className="admin-form-checkbox-card"
                      htmlFor="product-featured"
                    >
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
                      Precio en ARS ($){' '}
                      <span className="admin-required">*</span>
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
                        aria-describedby={
                          errors.price ? 'error-price' : undefined
                        }
                      />
                    </div>
                    {errors.price && (
                      <span
                        className="admin-form-error-msg"
                        id="error-price"
                        role="alert"
                      >
                        {errors.price}
                      </span>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="admin-form-group">
                    <label htmlFor="product-stock" className="admin-form-label">
                      Stock Disponible{' '}
                      <small className="admin-label-optional">(Por defecto: 0)</small>
                    </label>
                    <input
                      type="number"
                      id="product-stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="1"
                      className={`admin-form-input ${errors.stock ? 'admin-form-input--error' : ''}`}
                      aria-invalid={Boolean(errors.stock)}
                      aria-describedby={
                        errors.stock ? 'error-stock' : undefined
                      }
                    />
                    {errors.stock && (
                      <span
                        className="admin-form-error-msg"
                        id="error-stock"
                        role="alert"
                      >
                        {errors.stock}
                      </span>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                <div className="admin-form-group">
                  <label
                    htmlFor="product-description"
                    className="admin-form-label"
                  >
                    Descripción Artesanal{' '}
                    <small className="admin-label-optional">(Opcional)</small>
                  </label>
                  <textarea
                    id="product-description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describí los detalles de construcción, el veteado de la madera y el propósito del diseño... (Opcional)"
                    className={`admin-form-textarea ${
                      errors.description ? 'admin-form-input--error' : ''
                    }`}
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={
                      errors.description ? 'error-description' : undefined
                    }
                  />
                  {errors.description && (
                    <span
                      className="admin-form-error-msg"
                      id="error-description"
                      role="alert"
                    >
                      {errors.description}
                    </span>
                  )}
                </div>
              </div>

              {/* =========================================================
                  PASO 2: Fotografía del Mueble
                  ========================================================= */}
              <div
                className={`admin-step-content ${currentStep === 2 ? 'admin-step-content--active' : ''}`}
                id="step-2"
              >
                <div className="admin-step-header">
                  <div className="admin-step-header-icon" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div className="admin-step-header-text">
                    <h2
                      className="admin-form-section-title"
                      style={{ margin: 0, padding: 0, border: 'none' }}
                    >
                      Fotografía del Mueble
                    </h2>
                    <p>
                      Seleccioná del catálogo del taller o subí un archivo en
                      alta resolución.
                    </p>
                  </div>
                </div>

                {/* Pestañas para elegir la forma de cargar la imagen */}
                <div
                  className="admin-img-tabs"
                  role="tablist"
                  aria-label="Métodos de selección de imagen"
                >
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
                    <p
                      className="admin-form-hint"
                      style={{ marginBottom: '12px' }}
                    >
                      Elegí una fotografía existente de la colección artesanal o de tus imágenes subidas a la nube:
                    </p>

                    {/* Subsección: Imágenes en Vercel Blob */}
                    <div className="admin-gallery-section-title">
                      <span>☁️ Imágenes en la Nube (Vercel Blob)</span>
                      {blobImages.length > 0 && <span>({blobImages.length})</span>}
                    </div>

                    <div
                      className="admin-gallery-grid"
                      role="group"
                      aria-label="Imágenes subidas a la nube"
                      style={{ marginBottom: '16px' }}
                    >
                      {loadingBlobs ? (
                        <div className="admin-gallery-empty-hint">
                          <span className="admin-spinner" style={{ marginRight: '8px' }} />
                          Cargando imágenes de Vercel Blob...
                        </div>
                      ) : blobImages.length === 0 ? (
                        <div className="admin-gallery-empty-hint">
                          No hay imágenes subidas a la nube todavía. Podés subir una desde la pestaña <strong>"Subir desde mi Computadora"</strong>.
                        </div>
                      ) : (
                        blobImages.map((blob) => {
                          const isSelected = formData.image === blob.url;
                          const displayName = getBlobName(blob);
                          return (
                            <div
                              key={blob.url}
                              className={`admin-gallery-card ${isSelected ? 'admin-gallery-card--selected' : ''}`}
                              onClick={() => handleSelectGalleryImage(blob.url)}
                              title={`Seleccionar ${displayName}`}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) =>
                                e.key === 'Enter' && handleSelectGalleryImage(blob.url)
                              }
                            >
                              <div className="admin-gallery-thumb-box">
                                <img
                                  src={blob.url}
                                  alt={displayName}
                                  className="admin-gallery-img"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = FALLBACK_PRODUCT_IMAGE;
                                  }}
                                />

                                {/* Botón X circular para eliminar la imagen */}
                                <button
                                  type="button"
                                  className="admin-gallery-delete-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setBlobToDelete(blob);
                                  }}
                                  title="Eliminar de Vercel Blob"
                                  aria-label={`Eliminar imagen ${displayName}`}
                                >
                                  ✕
                                </button>

                                <span className="admin-gallery-blob-badge">Nube</span>

                                {isSelected && (
                                  <div
                                    className="admin-gallery-selected-badge"
                                    style={{ top: 'auto', bottom: '4px', right: '4px' }}
                                    aria-label="Seleccionado"
                                  >
                                    ✓
                                  </div>
                                )}
                              </div>
                              <span className="admin-gallery-title" title={displayName}>
                                {displayName}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Subsección: Colección Base Local */}
                    <div className="admin-gallery-section-title">
                      <span>🏛️ Colección Base Hermanos Jota ({CATALOG_GALLERY.length})</span>
                    </div>

                    <div
                      className="admin-gallery-grid"
                      role="group"
                      aria-label="Galería base de muebles"
                    >
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
                                  e.target.src = FALLBACK_PRODUCT_IMAGE;
                                }}
                              />
                              {isSelected && (
                                <div
                                  className="admin-gallery-selected-badge"
                                  aria-label="Seleccionado"
                                >
                                  ✓
                                </div>
                              )}
                            </div>
                            <span className="admin-gallery-title">
                              {item.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Contenido Pestaña 2: Subir archivo local */}
                {imageSourceTab === 'upload' && (
                  <div className="admin-img-tab-content">
                    <p
                      className="admin-form-hint"
                      style={{ marginBottom: '12px' }}
                    >
                      Seleccioná una imagen desde tu dispositivo (JPG, PNG,
                      WEBP). Se procesará de inmediato para el catálogo:
                    </p>
                    <div
                      className={`admin-dropzone ${isDragging ? 'admin-dropzone--drag-over' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && fileInputRef.current?.click()
                      }
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
                      {isDragging ? (
                        <strong style={{ color: 'var(--siena)' }}>
                          ¡Soltá tu imagen acá para subirla!
                        </strong>
                      ) : (
                        <>
                          <strong>
                            Hacé clic acá para elegir una imagen de tus archivos
                          </strong>
                          <span>o arrastrá un archivo PNG, JPG o WEBP acá</span>
                        </>
                      )}
                    </div>

                    {uploadingImage && (
                      <p
                        className="admin-form-hint"
                        style={{
                          color: 'var(--color-primary, #b3541e)',
                          marginTop: '8px',
                          fontWeight: 500,
                        }}
                      >
                        ⏳ Subiendo imagen a la nube, aguardá un momento...
                      </p>
                    )}

                    {localFileName && (
                      <div className="admin-upload-status">
                        <span className="admin-upload-file-tag">
                          📎 {localFileName} {uploadingImage ? '(subiendo...)' : '✓'}
                        </span>
                        <button
                          type="button"
                          className="admin-upload-clear-btn"
                          onClick={handleClearImage}
                          disabled={uploadingImage}
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
                      <label
                        htmlFor="product-image"
                        className="admin-form-label"
                      >
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
                        Podés ingresar un enlace web directo a la fotografía
                        (http/https) o una ruta interna del proyecto.
                      </p>

                      {/* Mini vista previa inmediata del enlace ingresado */}
                      {(formData.image || '').trim() && (
                        <div
                          style={{
                            marginTop: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.75rem 1rem',
                            background: '#f9f9f9',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <img
                            key={(formData.image || '').trim()}
                            src={getProductImageUrl(formData.image)}
                            alt="Vista previa del enlace"
                            style={{
                              width: '56px',
                              height: '56px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#fff',
                            }}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong
                              style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: '#1e293b',
                              }}
                            >
                              Vista previa del enlace
                            </strong>
                            <span
                              style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                color: '#64748b',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {(formData.image || '').trim()}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.8rem',
                              whiteSpace: 'nowrap',
                            }}
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, image: '' }))
                            }
                          >
                            Limpiar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* =========================================================
                  PASO 3: Ficha Técnica (Especificaciones del Taller)
                  ========================================================= */}
              <div
                className={`admin-step-content ${currentStep === 3 ? 'admin-step-content--active' : ''}`}
                id="step-3"
              >
                <div className="admin-step-header">
                  <div className="admin-step-header-icon" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div className="admin-step-header-text">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2
                        className="admin-form-section-title"
                        style={{ margin: 0, padding: 0, border: 'none' }}
                      >
                        Ficha de Taller (Especificaciones)
                      </h2>
                      <span className="admin-optional-pill">Opcionales</span>
                    </div>
                    <p>
                      Parámetros constructivos de la carpintería artesanal de autor.
                    </p>
                  </div>
                </div>

                <p className="admin-form-hint" style={{ marginBottom: '16px' }}>
                  Cada tipo de mueble puede tener sus propias características
                  (medidas, peso, rotación, tapizado o capacidad). Completá solo
                  las que apliquen a esta pieza artesanal:
                </p>

                {/* Medidas compuestas (Ancho × Profundidad × Alto cm) */}
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Medidas (Ancho × Profundidad × Alto){' '}
                    <small className="admin-label-optional">(Opcional)</small>
                  </label>
                  <div
                    className={`admin-dimensions-row ${
                      errors.medidas ? 'admin-dimensions-row--error' : ''
                    }`}
                  >
                    <div className="admin-dim-field">
                      <input
                        type="text"
                        id="product-ancho"
                        name="ancho"
                        value={specs.ancho}
                        onChange={handleSpecChange}
                        placeholder="180"
                        className="admin-dim-input"
                        aria-label="Ancho en centímetros"
                      />
                      <span className="admin-dim-label">Ancho</span>
                    </div>

                    <span className="admin-dim-symbol" aria-hidden="true">
                      ×
                    </span>

                    <div className="admin-dim-field">
                      <input
                        type="text"
                        id="product-prof"
                        name="prof"
                        value={specs.prof}
                        onChange={handleSpecChange}
                        placeholder="45"
                        className="admin-dim-input"
                        aria-label="Profundidad en centímetros"
                      />
                      <span className="admin-dim-label">Profundidad</span>
                    </div>

                    <span className="admin-dim-symbol" aria-hidden="true">
                      ×
                    </span>

                    <div className="admin-dim-field">
                      <input
                        type="text"
                        id="product-alto"
                        name="alto"
                        value={specs.alto}
                        onChange={handleSpecChange}
                        placeholder="75"
                        className="admin-dim-input"
                        aria-label="Alto en centímetros"
                      />
                      <span className="admin-dim-label">Alto</span>
                    </div>

                    <span className="admin-dim-unit">cm</span>
                  </div>
                  {errors.medidas && (
                    <span className="admin-form-error-msg" role="alert">
                      {errors.medidas}
                    </span>
                  )}
                </div>

                {/* Materiales y Acabado */}
                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label
                      htmlFor="product-materiales"
                      className="admin-form-label"
                    >
                      Materiales{' '}
                      <small className="admin-label-optional">(Opcional)</small>
                    </label>
                    <input
                      type="text"
                      id="product-materiales"
                      name="materiales"
                      value={specs.materiales}
                      onChange={handleSpecChange}
                      placeholder="Ej: Nogal macizo FSC®, herrajes de latón"
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label
                      htmlFor="product-acabado"
                      className="admin-form-label"
                    >
                      Acabado{' '}
                      <small className="admin-label-optional">(Opcional)</small>
                    </label>
                    <input
                      type="text"
                      id="product-acabado"
                      name="acabado"
                      value={specs.acabado}
                      onChange={handleSpecChange}
                      placeholder="Ej: Aceite natural ecológico"
                      className="admin-form-input"
                    />
                  </div>
                </div>

                {/* Especificaciones dinámicas adicionales */}
                {customSpecs.length > 0 && (
                  <div className="admin-custom-specs-list">
                    <strong className="admin-custom-specs-heading">
                      Especificaciones Secundarias del Mueble:
                    </strong>
                    {customSpecs.map((item) => {
                      const isPeso =
                        item.tipo === 'peso' ||
                        item.clave === 'peso' ||
                        item.key === 'peso';
                      const isOtro = item.tipo === 'otro';

                      return (
                        <div
                          key={item.id}
                          className={`admin-custom-spec-row ${
                            isOtro ? 'admin-custom-spec-row--otro' : ''
                          }`}
                        >
                          {/* Selector de Tipo de Especificación */}
                          <div className="admin-custom-spec-select-col">
                            <label className="admin-form-label-sr">
                              Tipo de especificación
                            </label>
                            <select
                              value={item.tipo || (isPeso ? 'peso' : 'otro')}
                              onChange={(e) =>
                                handleSpecTypeChange(item.id, e.target.value)
                              }
                              className="admin-form-select admin-spec-select"
                              aria-label="Seleccionar tipo de especificación"
                            >
                              <option value="peso">Peso (kg)</option>
                              <option value="capacidad">Capacidad</option>
                              <option value="tapizado">Tapizado</option>
                              <option value="rotacion">Rotación</option>
                              <option value="otro">Otro (personalizado)</option>
                            </select>
                          </div>

                          {/* Si eligieron 'otro', se habilitan los dos inputs libres */}
                          {isOtro && (
                            <div className="admin-custom-spec-col">
                              <label className="admin-form-label-sr">
                                Nombre de propiedad
                              </label>
                              <input
                                type="text"
                                placeholder="Propiedad (ej: Estilo, Garantía)"
                                value={item.clave || item.key || ''}
                                onChange={(e) =>
                                  handleUpdateCustomSpec(
                                    item.id,
                                    'clave',
                                    e.target.value
                                  )
                                }
                                className="admin-form-input"
                                aria-label="Nombre de propiedad personalizada"
                              />
                            </div>
                          )}

                          {/* Input de valor: si eligen peso, concatena automáticamente kg con sufijo visual */}
                          <div className="admin-custom-spec-val-col">
                            <label className="admin-form-label-sr">
                              Valor de especificación
                            </label>
                            {isPeso ? (
                              <div className="admin-input-suffix-wrapper">
                                <input
                                  type="text"
                                  placeholder="Ej: 68 o 42"
                                  value={item.valor || item.value || ''}
                                  onChange={(e) =>
                                    handleUpdateCustomSpec(
                                      item.id,
                                      'valor',
                                      e.target.value
                                    )
                                  }
                                  className="admin-form-input admin-form-input--suffixed"
                                  aria-label="Peso en kilogramos"
                                />
                                <span className="admin-input-suffix">kg</span>
                              </div>
                            ) : (
                              <input
                                type="text"
                                placeholder={
                                  item.tipo === 'capacidad'
                                    ? 'Ej: 45 kg por estante, 6 comensales'
                                    : item.tipo === 'tapizado'
                                    ? 'Ej: Repelente al agua y manchas'
                                    : item.tipo === 'rotacion'
                                    ? 'Ej: 360° silenciosa y suave'
                                    : 'Valor (ej: Nórdico, 5 años)'
                                }
                                value={item.valor || item.value || ''}
                                onChange={(e) =>
                                  handleUpdateCustomSpec(
                                    item.id,
                                    'valor',
                                    e.target.value
                                  )
                                }
                                className="admin-form-input"
                                aria-label="Valor de la especificación"
                              />
                            )}
                          </div>

                          {/* Botón eliminar */}
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
                      );
                    })}
                  </div>
                )}

                {errors.customSpecs && (
                  <span
                    className="admin-form-error-msg"
                    style={{ marginTop: '8px', display: 'block' }}
                    role="alert"
                  >
                    {errors.customSpecs}
                  </span>
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

                {/* Caja de Compromiso de Calidad Hermanos Jota */}
                <div className="admin-craft-guarantee-box">
                  <svg
                    className="admin-craft-guarantee-icon"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <div className="admin-craft-guarantee-text">
                    <h4>Garantía Hermanos Jota</h4>
                    <p>
                      Todas las maderas provienen de bosques con manejo responsable
                      certificado FSC®. Secado en cámara al 10% de humedad para
                      máxima estabilidad.
                    </p>
                  </div>
                </div>
              </div>

              {/* =========================================================
                  ACCIONES DE NAVEGACIÓN INFERIOR (STEPPER CONTROLS)
                  ========================================================= */}
              <div className="admin-wizard-actions">
                <button
                  type="button"
                  className="admin-wizard-btn-prev"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  id="btn-prev-step"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  <span>Anterior</span>
                </button>

                <div className="admin-wizard-actions-right">
                  <Link to="/admin" className="admin-wizard-btn-cancel">
                    Cancelar
                  </Link>

                  {currentStep < totalSteps ? (
                    <>
                      <button
                        type="button"
                        className="admin-wizard-btn-next"
                        onClick={handleNextStep}
                        id="btn-next-step"
                      >
                        <span>Siguiente</span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>

                      <button
                        type="submit"
                        className="admin-wizard-btn-save-direct"
                        disabled={submitting || uploadingImage}
                        id="btn-submit-product"
                        title={
                          isEdit
                            ? 'Guardar cambios directamente'
                            : 'Publicar directamente'
                        }
                      >
                        {submitting
                          ? 'Guardando...'
                          : isEdit
                            ? 'Guardar Cambios'
                            : 'Publicar Mueble'}
                      </button>
                    </>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-primary admin-btn-submit admin-wizard-btn-final-submit"
                      disabled={submitting || uploadingImage}
                      id="btn-submit-product"
                    >
                      {submitting ? (
                        <>
                          <span className="admin-spinner" aria-hidden="true" />
                          <span>Guardando mueble...</span>
                        </>
                      ) : uploadingImage ? (
                        <>
                          <span className="admin-spinner" aria-hidden="true" />
                          <span>Subiendo imagen...</span>
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
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>
                            {isEdit ? 'Guardar Cambios' : 'Publicar Mueble'}
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Columna Lateral: Vista Previa en Tiempo Real */}
          <aside
            className="admin-preview-column"
            aria-label="Vista previa en tiempo real"
          >
            <div className="admin-preview-sticky">
              <div className="admin-preview-badge">
                <span className="admin-preview-dot" aria-hidden="true" />
                Vista Previa en Vivo
              </div>

              <div className="admin-preview-card">
                {/* Imagen y badges flotantes */}
                <div className="admin-preview-img-wrapper">
                  <img
                    key={(formData.image || '').trim() || 'preview-placeholder'}
                    src={getProductImageUrl(formData.image)}
                    alt={formData.name || 'Vista previa del mueble'}
                    className="admin-preview-img"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
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
                      <span className="stock-indicator-dot" aria-hidden="true">
                        ●
                      </span>
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

                  {/* Ficha técnica compacta en la vista previa (normalizada con formatSpecs) */}
                  {(() => {
                    const previewSpecs = formatSpecs({
                      ancho: specs.ancho,
                      prof: specs.prof,
                      alto: specs.alto,
                      materiales: specs.materiales,
                      acabado: specs.acabado,
                      customSpecs,
                    });
                    const hasSpecs = Object.keys(previewSpecs).length > 0;
                    if (!hasSpecs) return null;

                    return (
                      <div className="admin-preview-specs">
                        {previewSpecs.medidas && (
                          <div className="admin-preview-spec-item">
                            <span>Medidas:</span> {previewSpecs.medidas}
                          </div>
                        )}
                        {previewSpecs.materiales && (
                          <div className="admin-preview-spec-item">
                            <span>Materiales:</span> {previewSpecs.materiales}
                          </div>
                        )}
                        {previewSpecs.acabado && (
                          <div className="admin-preview-spec-item">
                            <span>Acabado:</span> {previewSpecs.acabado}
                          </div>
                        )}
                        {Object.entries(previewSpecs)
                          .filter(
                            ([k]) =>
                              !['medidas', 'materiales', 'acabado'].includes(k)
                          )
                          .map(([k, val]) => (
                            <div key={k} className="admin-preview-spec-item">
                              <span style={{ textTransform: 'capitalize' }}>
                                {k}:
                              </span>{' '}
                              {val}
                            </div>
                          ))}
                      </div>
                    );
                  })()}

                  <div className="admin-preview-footer">
                    <span className="admin-preview-price-label">
                      Precio Catálogo
                    </span>
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
                  Los cambios que realices se sincronizan en vivo con esta
                  tarjeta de presentación.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal interactivo de confirmación destructiva para eliminar imagen de Vercel Blob */}
      <ConfirmDeleteModal
        isOpen={Boolean(blobToDelete)}
        onClose={() => !isDeletingBlob && setBlobToDelete(null)}
        onConfirm={handleConfirmDeleteBlob}
        title="¿Eliminar imagen de Vercel Blob?"
        itemName={blobToDelete ? getBlobName(blobToDelete) : ''}
        itemType="imagen"
        confirmKeyword="confirmar"
        isDeleting={isDeletingBlob}
        warningMessage="Esta imagen se borrará de forma permanente de los servidores en la nube de Vercel. Si algún producto del catálogo la está usando, dejará de mostrarse."
      />
    </section>
  );
}

export default ProductForm;
