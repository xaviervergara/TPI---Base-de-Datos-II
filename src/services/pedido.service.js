import { Pedido, Producto } from "../models/index.js";

/**
 * CREATE: arma el pedido con ítems embebidos y un snapshot del producto.
 * Los ítems recibidos tienen el formato { producto_id, cantidad }.
 */
export async function crearPedido({ cliente, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("El pedido debe incluir al menos un ítem.");
  }

  const ids = items.map((i) => i.producto_id);
  const productos = await Producto.find({
    _id: { $in: ids },
    activo: true,
  });
  const porId = new Map(productos.map((p) => [p._id.toString(), p]));

  const itemsDetalle = items.map(({ producto_id, cantidad }) => {
    const producto = porId.get(String(producto_id));
    if (!producto) {
      throw new Error(`Producto ${producto_id} inexistente o inactivo.`);
    }
    return {
      producto_id: producto._id,
      nombre: producto.nombre,
      precioUnitario: producto.precio,
      cantidad,
    };
  });

  const total = itemsDetalle.reduce(
    (acc, i) => acc + i.precioUnitario * i.cantidad,
    0,
  );

  return Pedido.create({
    cliente,
    items: itemsDetalle,
    total,
  });
}

/** READ (solo pedidos activos, con los productos vinculados resueltos) */
export async function listarPedidos() {
  return Pedido.find({ activo: true })
    .populate("items.producto_id", "nombre precio")
    .sort({ createdAt: -1 });
}

/** UPDATE de campos específicos (por ejemplo, los datos del cliente) */
export async function actualizarPedido(id, cambios) {
  return Pedido.findOneAndUpdate(
    { _id: id, activo: true },
    { $set: cambios },
    { new: true, runValidators: true },
  );
}

/** DELETE (baja lógica) */
export async function bajaLogicaPedido(id) {
  return Pedido.findByIdAndUpdate(
    id,
    { $set: { activo: false } },
    { new: true },
  );
}
