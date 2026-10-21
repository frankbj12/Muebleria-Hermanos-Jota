import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'El stock no puede ser negativo'],
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    // Campos de compatibilidad con la UI actual acordados en la Fase 0
    category: {
      type: String,
      trim: true,
      default: 'general',
    },
    featured: {
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
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
