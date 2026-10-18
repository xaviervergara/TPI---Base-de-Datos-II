# Respaldo y Restauración — TPI Base de Datos II

## Objetivo

Automatizar el respaldo físico de la base `tienda_tpi` alojada en MongoDB Atlas
usando la herramienta nativa `mongodump`, dejando una copia por fecha en el
directorio `resguardos_tpi/` del proyecto.

## Estructura de los resguardos

```
resguardos_tpi/
└── 2026-10-17_15-30-00/        # subcarpeta creada con la fecha/hora actual
    └── tienda_tpi/
        ├── categorias.bson
        ├── categorias.metadata.json
        ├── productos.bson
        ├── productos.metadata.json
        ├── pedidos.bson
        └── pedidos.metadata.json
```

## Ejecución

```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

El script resuelve sus rutas de forma relativa a su propia ubicación, por lo que
puede ejecutarse desde cualquier directorio. La `MONGO_URI` se toma del entorno
o, si no está definida, se lee del archivo `.env` del proyecto.

## Restauración

```bash
./scripts/restore.sh resguardos_tpi/2026-10-17_15-30-00
```

Por seguridad, la restauración no sobrescribe la base original: recupera los
datos en una base nueva `<DB_NAME>_restore`.

## Política de respaldo (RPO / RTO)

| Concepto                           | Valor        | Justificación                                                                                            |
| ---------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| **RPO** (Recovery Point Objective) | 24 horas     | Se asume un respaldo diario automático. La pérdida máxima de datos aceptable es la de la última jornada. |
| **RTO** (Recovery Time Objective)  | ≤ 30 minutos | Con `mongorestore` sobre el clúster M0, la base (pequeña) se restaura en pocos minutos.                  |

### Justificación

- **RPO = 24 h:** el sistema es de baja criticidad (trabajo académico / tienda
  pequeña). Un respaldo diario por `cron` es suficiente y económico.
- **RTO ≤ 30 min:** el volumen es reducido, por lo que el tiempo de descarga +
  `mongorestore` es acotado. Se documenta el procedimiento para que cualquier
  administrador pueda ejecutarlo.

### Automatización sugerida (cron)

```bash
# Respaldo diario a las 02:00
0 2 * * * /ruta/al/proyecto/scripts/backup.sh >> /ruta/al/proyecto/resguardos_tpi/cron.log 2>&1
```
