import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'El stock no puede ser negativo'],
    },
    imagenUrl: {
      type: String,
      trim: true,
      default: '',
    },
    // Campos de compatibilidad con la UI actual acordados en la Fase 0
    categoria: {
      type: String,
      trim: true,
      default: 'general',
    },
    destacado: {
      type: Boolean,
      default: false,
    },
    specs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals para compatibilidad con la UI actual del frontend (campos en inglés e id)
productSchema.virtual('id').get(function () {
  return this._id ? this._id.toHexString() : undefined;
});

productSchema.virtual('name').get(function () {
  return this.nombre;
});

productSchema.virtual('description').get(function () {
  return this.descripcion;
});

productSchema.virtual('price').get(function () {
  return this.precio;
});

productSchema.virtual('image').get(function () {
  return this.imagenUrl;
});

productSchema.virtual('category').get(function () {
  return this.categoria;
});

productSchema.virtual('featured').get(function () {
  return this.destacado;
});

const Product = mongoose.model('Product', productSchema);

export default Product;
