# TPI — Base de Datos II · MongoDB Atlas + Mongoose

Trabajo Práctico Integrador de **Base de Datos II (NoSQL)**.
Sistema de gestión para una **tienda de informática**: catálogo de productos por
categoría y registro de pedidos.

## 1. Negocio elegido

Una tienda de informática necesita administrar:

- Su **catálogo** de productos agrupados por **categoría**.
- Los **pedidos** de sus clientes, con el detalle de los productos comprados.

## 2. Modelo de datos

Tres colecciones relacionadas: `categorias`, `productos`, `pedidos`.

### `categorias`
```json
{
  "_id": "665f1c...",
  "nombre": "Periféricos",
  "descripcion": "Teclados, mouse y cámaras",
  "activo": true,
  "createdAt": "2026-10-17T15:00:00.000Z",
  "updatedAt": "2026-10-17T15:00:00.000Z"
}
```

### `productos` (Linking → categoría · Embedding → proveedor)
```json
{
  "_id": "665f2a...",
  "nombre": "Teclado mecánico",
  "precio": 45000,
  "stock": 28,
  "categoria_id": "665f1c...",
  "proveedor": { "nombre": "TechImport S.A.", "contacto": "ventas@techimport.com" },
  "activo": true,
  "createdAt": "2026-10-17T15:01:00.000Z",
  "updatedAt": "2026-10-17T15:01:00.000Z"
}
```

### `pedidos` (Embedding → cliente e ítems · Linking → producto)
```json
{
  "_id": "665f3b...",
  "cliente": { "nombre": "Ana Pérez", "email": "ana@example.com" },
  "items": [
    { "producto_id": "665f2a...", "nombre": "Teclado mecánico", "precioUnitario": 45000, "cantidad": 1 },
    { "producto_id": "665f2b...", "nombre": "Mouse inalámbrico", "precioUnitario": 22000, "cantidad": 2 }
  ],
  "total": 89000,
  "activo": true,
  "createdAt": "2026-10-17T15:05:00.000Z",
  "updatedAt": "2026-10-17T15:05:00.000Z"
}
```

### Justificación de Embedding vs Linking

| Relación | Técnica | Motivo |
| --- | --- | --- |
| `productos` → `categorias` | **Linking** (`categoria_id`) | La categoría es una entidad propia, reutilizable por muchos productos y que cambia de forma independiente. Referenciarla evita duplicar datos. |
| `productos` → `proveedor` | **Embedding** | Dato pequeño que siempre se consulta junto al producto y no se usa en otras relaciones. Se lee en una sola operación. |
| `pedidos` → `cliente` | **Embedding** | Información de la venta, sin entidad propia en este alcance. |
| `pedidos` → `items` | **Embedding** | El detalle de la venta no tiene sentido fuera del pedido; guardamos un *snapshot* (nombre y precio del momento de la compra). |
| `pedidos.items` → `productos` | **Linking** (`producto_id`) | El stock y precio actuales viven en el producto; se referencia para no perder el vínculo. |

### Baja lógica

Todas las colecciones tienen el campo `activo`. **Nunca se elimina un documento
físicamente**: la operación de "borrado" cambia `activo` a `false` y las
consultas de lectura filtran siempre `{ activo: true }`.

## 3. Arquitectura

Separación en capas simples:

```
src/
├── config/db.js                 # Conexión a MongoDB Atlas (Mongoose)
├── models/                      # Definición de esquemas (Categoria, Producto, Pedido)
│   ├── Categoria.js
│   ├── Producto.js
│   ├── Pedido.js
│   └── index.js
├── services/                    # Lógica/persistencia: CRUD y baja lógica
│   ├── categoria.service.js
│   ├── producto.service.js
│   └── pedido.service.js
├── seed.js                      # Datos de prueba
└── app.js                       # Backend: CLI interactivo
scripts/
├── backup.sh                    # Respaldo con mongodump
└── restore.sh                   # Restauración con mongorestore
docs/backup.md                   # Informe RTO/RPO
```

## 4. Requisitos

- Node.js 18+ y npm
- MongoDB Database Tools (`mongodump`, `mongorestore`)
- Un clúster en MongoDB Atlas (M0) con usuario y acceso de red configurados

## 5. Puesta en marcha

```bash
# 1. Dependencias
npm install

# 2. Configurar credenciales
cp .env.example .env
#    ↳ editar .env y pegar tu connection string en MONGO_URI

# 3. (Opcional) Cargar datos de prueba
npm run seed

# 4. Ejecutar la aplicación (menú CRUD)
npm start
```

## 6. Operaciones CRUD

La app expone por consola las operaciones del ciclo de vida de los datos:

- **CREATE:** crear categoría, producto y pedido.
- **READ:** listar solo registros activos (respeta la baja lógica).
- **UPDATE:** modificar campos (precio/stock, datos del cliente, etc.).
- **DELETE (baja lógica):** marcar `activo: false` sin borrar físicamente.

## 7. Respaldo

```bash
chmod +x scripts/backup.sh scripts/restore.sh
./scripts/backup.sh                                  # genera resguardos_tpi/<fecha>/
./scripts/restore.sh resguardos_tpi/<fecha>          # restaura en <db>_restore
```

Detalle de RTO/RPO y política de respaldo en [`docs/backup.md`](docs/backup.md).

## 8. Entregables

- [x] Descripción del negocio
- [x] Esquemas JSON de las colecciones
- [ ] Capturas de Atlas (clúster, usuarios, colecciones)
- [ ] Connection string para corrección
- [x] Código backend (conexión + CRUD)
- [x] Script de backup + informe RTO/RPO
- [ ] Conclusión (comunicación Cliente-Servidor)
