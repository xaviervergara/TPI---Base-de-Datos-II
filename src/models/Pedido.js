import mongoose from "mongoose";

/**
 * EMBEDDING: el detalle de una venta solo tiene sentido dentro del pedido,
 * por eso cada ítem se guarda embebido. Se guarda un "snapshot" del nombre
 * y precio del producto al momento de la compra.
 */
const itemSchema = new mongoose.Schema(
  {
    /**
     * LINKING: se referencia al producto real para conocer stock/precio actual.
     */
    producto_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
    },
    nombre: { type: String, required: true },
    precioUnitario: { type: Number, required: true, min: 0 },
    cantidad: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const pedidoSchema = new mongoose.Schema(
  {
    // EMBEDDING: datos del cliente embebidos dentro del pedido.
    cliente: {
      nombre: { type: String, required: true, trim: true },
      email: { type: String, trim: true },
    },
    items: {
      type: [itemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "El pedido debe tener al menos un ítem.",
      },
    },
    total: {
      type: Number,
      min: 0,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "pedidos",
  },
);

export const Pedido = mongoose.model("Pedido", pedidoSchema);
