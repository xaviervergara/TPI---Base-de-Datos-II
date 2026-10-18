import { Categoria } from "../models/index.js";

/** CREATE */
export async function crearCategoria(datos) {
  const categoria = await Categoria.create({
    nombre: datos.nombre,
    descripcion: datos.descripcion,
  });
  return categoria;
}

/** READ (solo categorías activas) */
export async function listarCategorias() {
  return Categoria.find({ activo: true }).sort({ nombre: 1 });
}

/** UPDATE de campos específicos */
export async function actualizarCategoria(id, cambios) {
  return Categoria.findOneAndUpdate(
    { _id: id, activo: true },
    { $set: cambios },
    { new: true, runValidators: true },
  );
}

/** DELETE (baja lógica) */
export async function bajaLogicaCategoria(id) {
  return Categoria.findByIdAndUpdate(
    id,
    { $set: { activo: false } },
    { new: true },
  );
}
