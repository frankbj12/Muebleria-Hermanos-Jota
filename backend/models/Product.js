import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    name: {
      type: String,
      alias: 'nombre',
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
    },
    description: {
      type: String,
      alias: 'descripcion',
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      alias: 'precio',
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
      alias: 'imagenUrl',
      trim: true,
      default: '',
    },
    // Campos de compatibilidad con la UI actual acordados en la Fase 0
    category: {
      type: String,
      alias: 'categoria',
      trim: true,
      default: 'general',
    },
    featured: {
      type: Boolean,
      alias: 'destacado',
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
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        if (ret._id) {
          ret.id = ret._id.toString();
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        if (ret._id) {
          ret.id = ret._id.toString();
        }
        return ret;
      },
    },
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
