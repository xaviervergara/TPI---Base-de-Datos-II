import mongoose from "mongoose";

/**
 * EMBEDDING: el proveedor es un dato pequeño que siempre se consulta
 * junto con el producto, por eso se guarda embebido (subdocumento).
 */
const proveedorSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    contacto: { type: String, trim: true },
  },
  { _id: false },
);

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    /**
     * LINKING: la categoría es una entidad propia y reutilizable,
     * por eso se referencia por ObjectId en lugar de embeberla.
     */
    categoria_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
      required: true,
    },
    proveedor: {
      type: proveedorSchema,
      required: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "productos",
  },
);

export const Producto = mongoose.model("Producto", productoSchema);
