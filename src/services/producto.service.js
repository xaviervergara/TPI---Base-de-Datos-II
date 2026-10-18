import { Categoria, Producto } from "../models/index.js";

/** CREATE */
export async function crearProducto(datos) {
  const categoria = await Categoria.findOne({
    _id: datos.categoria_id,
    activo: true,
  });
  if (!categoria) {
    throw new Error("La categoría indicada no existe o está inactiva.");
  }

  return Producto.create({
    nombre: datos.nombre,
    precio: datos.precio,
    stock: datos.stock,
    categoria_id: datos.categoria_id,
    proveedor: datos.proveedor,
  });
}

/** READ (solo productos activos, con la categoría vinculada resuelta) */
export async function listarProductos() {
  return Producto.find({ activo: true })
    .populate("categoria_id", "nombre")
    .sort({ nombre: 1 });
}

/** READ por id */
export async function obtenerProducto(id) {
  return Producto.findOne({ _id: id, activo: true }).populate(
    "categoria_id",
    "nombre",
  );
}

/** UPDATE de campos específicos */
export async function actualizarProducto(id, cambios) {
  return Producto.findOneAndUpdate(
    { _id: id, activo: true },
    { $set: cambios },
    { new: true, runValidators: true },
  );
}

/** DELETE (baja lógica) */
export async function bajaLogicaProducto(id) {
  return Producto.findByIdAndUpdate(
    id,
    { $set: { activo: false } },
    { new: true },
  );
}
