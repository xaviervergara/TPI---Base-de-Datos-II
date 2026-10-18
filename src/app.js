import "dotenv/config";
import readline from "node:readline/promises";

import { connectDB, disconnectDB } from "./config/db.js";
import {
  crearCategoria,
  listarCategorias,
  actualizarCategoria,
  bajaLogicaCategoria,
} from "./services/categoria.service.js";
import {
  crearProducto,
  listarProductos,
  actualizarProducto,
  bajaLogicaProducto,
} from "./services/producto.service.js";
import {
  crearPedido,
  listarPedidos,
  actualizarPedido,
  bajaLogicaPedido,
} from "./services/pedido.service.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const pedir = (texto) => rl.question(texto);
const imprimir = (data) => console.log(JSON.stringify(data, null, 2));

const MENU = `
================= TPI Base de Datos II — Tienda =================
 CATEGORÍAS
  1) Crear categoría
  2) Listar categorías (activas)
  3) Actualizar categoría
  4) Baja lógica de categoría
 PRODUCTOS
  5) Crear producto
  6) Listar productos (activos)
  7) Actualizar precio/stock
  8) Baja lógica de producto
 PEDIDOS
  9) Crear pedido
 10) Listar pedidos (activos)
 11) Actualizar datos del cliente
 12) Baja lógica de pedido
  0) Salir
================================================================`;

/* ----------------------------- CATEGORÍAS ----------------------------- */

async function accionCrearCategoria() {
  const nombre = (await pedir("Nombre de la categoría: ")).trim();
  const descripcion = (await pedir("Descripción (opcional): ")).trim();
  const creada = await crearCategoria({ nombre, descripcion });
  console.log("\n✔ Categoría creada:");
  imprimir(creada);
}

async function accionListarCategorias() {
  const categorias = await listarCategorias();
  if (categorias.length === 0) {
    console.log("\nNo hay categorías activas.");
    return;
  }
  console.log(`\n✔ ${categorias.length} categoría(s) activa(s):`);
  imprimir(categorias);
}

async function accionActualizarCategoria() {
  const id = (await pedir("ID de la categoría: ")).trim();
  const nombre = (await pedir("Nuevo nombre (Enter para omitir): ")).trim();
  const descripcion = (await pedir("Nueva descripción (Enter para omitir): ")).trim();

  const cambios = {};
  if (nombre) cambios.nombre = nombre;
  if (descripcion) cambios.descripcion = descripcion;

  if (Object.keys(cambios).length === 0) {
    console.log("No se ingresaron cambios.");
    return;
  }
  const actualizada = await actualizarCategoria(id, cambios);
  if (!actualizada) {
    console.log("No se encontró una categoría activa con ese ID.");
    return;
  }
  console.log("\n✔ Categoría actualizada:");
  imprimir(actualizada);
}

async function accionBajaLogicaCategoria() {
  const id = (await pedir("ID de la categoría a dar de baja: ")).trim();
  const dada = await bajaLogicaCategoria(id);
  if (!dada) {
    console.log("No se encontró una categoría con ese ID.");
    return;
  }
  console.log("\n✔ Categoría dada de baja lógicamente (activo: false):");
  imprimir(dada);
}

/* ------------------------------ PRODUCTOS ----------------------------- */

async function accionCrearProducto() {
  const categorias = await listarCategorias();
  if (categorias.length === 0) {
    console.log("\nPrimero creá al menos una categoría.");
    return;
  }
  console.log("\nCategorías disponibles:");
  categorias.forEach((c) => console.log(`  ${c._id}  ${c.nombre}`));

  const nombre = (await pedir("Nombre del producto: ")).trim();
  const precio = Number(await pedir("Precio: "));
  const stock = Number(await pedir("Stock: "));
  const categoria_id = (await pedir("ID de la categoría: ")).trim();
  const proveedorNombre = (await pedir("Nombre del proveedor: ")).trim();
  const proveedorContacto = (await pedir("Contacto del proveedor (opcional): ")).trim();

  const creado = await crearProducto({
    nombre,
    precio,
    stock,
    categoria_id,
    proveedor: { nombre: proveedorNombre, contacto: proveedorContacto },
  });
  console.log("\n✔ Producto creado:");
  imprimir(creado);
}

async function accionListarProductos() {
  const productos = await listarProductos();
  if (productos.length === 0) {
    console.log("\nNo hay productos activos.");
    return;
  }
  console.log(`\n✔ ${productos.length} producto(s) activo(s):`);
  imprimir(productos);
}

async function accionActualizarProducto() {
  const id = (await pedir("ID del producto: ")).trim();
  const precioStr = (await pedir("Nuevo precio (Enter para omitir): ")).trim();
  const stockStr = (await pedir("Nuevo stock (Enter para omitir): ")).trim();

  const cambios = {};
  if (precioStr) cambios.precio = Number(precioStr);
  if (stockStr) cambios.stock = Number(stockStr);

  if (Object.keys(cambios).length === 0) {
    console.log("No se ingresaron cambios.");
    return;
  }
  const actualizado = await actualizarProducto(id, cambios);
  if (!actualizado) {
    console.log("No se encontró un producto activo con ese ID.");
    return;
  }
  console.log("\n✔ Producto actualizado:");
  imprimir(actualizado);
}

async function accionBajaLogicaProducto() {
  const id = (await pedir("ID del producto a dar de baja: ")).trim();
  const dado = await bajaLogicaProducto(id);
  if (!dado) {
    console.log("No se encontró un producto con ese ID.");
    return;
  }
  console.log("\n✔ Producto dado de baja lógicamente (activo: false):");
  imprimir(dado);
}

/* ------------------------------- PEDIDOS ------------------------------ */

async function accionCrearPedido() {
  const productos = await listarProductos();
  if (productos.length === 0) {
    console.log("\nNo hay productos activos para vender.");
    return;
  }
  console.log("\nProductos disponibles:");
  productos.forEach((p) => console.log(`  ${p._id}  ${p.nombre}  $${p.precio}`));

  const nombre = (await pedir("Nombre del cliente: ")).trim();
  const email = (await pedir("Email del cliente (opcional): ")).trim();
  const entrada = (await pedir("Ítems (formato id:cantidad,id:cantidad): ")).trim();

  const items = entrada.split(",").map((par) => {
    const [producto_id, cantidad] = par.split(":").map((s) => s.trim());
    return { producto_id, cantidad: Number(cantidad) };
  });

  const creado = await crearPedido({ cliente: { nombre, email }, items });
  console.log("\n✔ Pedido creado:");
  imprimir(creado);
}

async function accionListarPedidos() {
  const pedidos = await listarPedidos();
  if (pedidos.length === 0) {
    console.log("\nNo hay pedidos activos.");
    return;
  }
  console.log(`\n✔ ${pedidos.length} pedido(s) activo(s):`);
  imprimir(pedidos);
}

async function accionActualizarPedido() {
  const id = (await pedir("ID del pedido: ")).trim();
  const nombre = (await pedir("Nuevo nombre del cliente (Enter para omitir): ")).trim();
  const email = (await pedir("Nuevo email del cliente (Enter para omitir): ")).trim();

  const cambios = {};
  if (nombre) cambios["cliente.nombre"] = nombre;
  if (email) cambios["cliente.email"] = email;

  if (Object.keys(cambios).length === 0) {
    console.log("No se ingresaron cambios.");
    return;
  }
  const actualizado = await actualizarPedido(id, cambios);
  if (!actualizado) {
    console.log("No se encontró un pedido activo con ese ID.");
    return;
  }
  console.log("\n✔ Pedido actualizado:");
  imprimir(actualizado);
}

async function accionBajaLogicaPedido() {
  const id = (await pedir("ID del pedido a dar de baja: ")).trim();
  const dado = await bajaLogicaPedido(id);
  if (!dado) {
    console.log("No se encontró un pedido con ese ID.");
    return;
  }
  console.log("\n✔ Pedido dado de baja lógicamente (activo: false):");
  imprimir(dado);
}

/* -------------------------------- LOOP -------------------------------- */

async function ejecutar(opcion) {
  switch (opcion) {
    case "1": await accionCrearCategoria(); return false;
    case "2": await accionListarCategorias(); return false;
    case "3": await accionActualizarCategoria(); return false;
    case "4": await accionBajaLogicaCategoria(); return false;
    case "5": await accionCrearProducto(); return false;
    case "6": await accionListarProductos(); return false;
    case "7": await accionActualizarProducto(); return false;
    case "8": await accionBajaLogicaProducto(); return false;
    case "9": await accionCrearPedido(); return false;
    case "10": await accionListarPedidos(); return false;
    case "11": await accionActualizarPedido(); return false;
    case "12": await accionBajaLogicaPedido(); return false;
    case "0": return true;
    default:
      console.log("Opción inválida.");
      return false;
  }
}

async function main() {
  await connectDB();
  console.log(MENU);

  let salir = false;
  while (!salir) {
    const opcion = (await pedir("Opción: ")).trim();
    try {
      salir = await ejecutar(opcion);
    } catch (error) {
      console.error(`\n✖ Error: ${error.message}`);
    }
    if (!salir) console.log(MENU);
  }
}

try {
  await main();
} catch (error) {
  console.error("Error fatal:", error.message);
} finally {
  rl.close();
  await disconnectDB();
}
