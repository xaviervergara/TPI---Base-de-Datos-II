import "dotenv/config";

import { connectDB, disconnectDB } from "./config/db.js";
import { Categoria } from "./models/index.js";
import { crearCategoria } from "./services/categoria.service.js";
import { crearProducto } from "./services/producto.service.js";
import { crearPedido } from "./services/pedido.service.js";

/**
 * Carga datos de prueba. Se ejecuta una sola vez (no duplica si ya hay datos).
 */
async function seed() {
  await connectDB();

  const existentes = await Categoria.countDocuments();
  if (existentes > 0) {
    console.log("La base ya contiene datos. Seed cancelado para no duplicar registros.");
    return;
  }

  const perifericos = await crearCategoria({
    nombre: "Periféricos",
    descripcion: "Teclados, mouse y cámaras",
  });
  const almacenamiento = await crearCategoria({
    nombre: "Almacenamiento",
    descripcion: "Discos y memorias",
  });

  const teclado = await crearProducto({
    nombre: "Teclado mecánico",
    precio: 45000,
    stock: 28,
    categoria_id: perifericos._id,
    proveedor: { nombre: "TechImport S.A.", contacto: "ventas@techimport.com" },
  });
  const mouse = await crearProducto({
    nombre: "Mouse inalámbrico",
    precio: 22000,
    stock: 34,
    categoria_id: perifericos._id,
    proveedor: { nombre: "TechImport S.A.", contacto: "ventas@techimport.com" },
  });
  const ssd = await crearProducto({
    nombre: "SSD 1TB NVMe",
    precio: 98000,
    stock: 12,
    categoria_id: almacenamiento._id,
    proveedor: { nombre: "DataStore Ltda.", contacto: "contacto@datastore.com" },
  });

  await crearPedido({
    cliente: { nombre: "Ana Pérez", email: "ana@example.com" },
    items: [
      { producto_id: teclado._id, cantidad: 1 },
      { producto_id: mouse._id, cantidad: 2 },
    ],
  });
  await crearPedido({
    cliente: { nombre: "Bruno Gómez", email: "bruno@example.com" },
    items: [{ producto_id: ssd._id, cantidad: 1 }],
  });

  console.log("Seed completado: 2 categorías, 3 productos y 2 pedidos.");
}

try {
  await seed();
} catch (error) {
  console.error("Error en el seed:", error.message);
} finally {
  await disconnectDB();
}
