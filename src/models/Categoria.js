import mongoose from "mongoose";

const categoriaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    // Baja lógica: nunca se elimina el documento físicamente.
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "categorias", //nomnbre de la coleccion en la bd fisica
  },
);

export const Categoria = mongoose.model("Categoria", categoriaSchema);
