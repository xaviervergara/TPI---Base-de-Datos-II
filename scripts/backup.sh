#!/usr/bin/env bash
#
# Respaldo de la base MongoDB Atlas con mongodump.
# Crea: resguardos_tpi/<fecha-hora>/<db>/*.bson
#
set -euo pipefail

# Rutas relativas: se resuelven a partir de la ubicación del script,
# por lo que puede ejecutarse desde cualquier directorio.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"

# Lee una variable desde el entorno o, si no existe, desde el .env
load_env_var() {
  local key="$1"
  if [[ -n "${!key:-}" ]]; then
    return 0
  fi
  [[ -f "$ENV_FILE" ]] || return 0
  local line value
  line="$(grep -E "^[[:space:]]*${key}=" "$ENV_FILE" | tail -n1 || true)"
  [[ -n "$line" ]] || return 0
  value="${line#*=}"
  value="${value%\"}"; value="${value#\"}"
  value="${value%\'}"; value="${value#\'}"
  export "${key}=${value}"
}

load_env_var MONGO_URI
load_env_var DB_NAME

: "${MONGO_URI:?Falta MONGO_URI. Definila en el archivo .env o expórtala en el entorno.}"
DB_NAME="${DB_NAME:-tienda_tpi}"

FECHA="$(date +%Y-%m-%d_%H-%M-%S)"
DEST_DIR="$PROJECT_DIR/resguardos_tpi/$FECHA"

mkdir -p "$DEST_DIR"

echo "==> Iniciando respaldo de la base '$DB_NAME'"
echo "==> Destino: resguardos_tpi/$FECHA"

mongodump --uri="$MONGO_URI" --db="$DB_NAME" --out="$DEST_DIR"

echo "==> Respaldo finalizado. Archivos generados:"
find "$DEST_DIR" -type f | sed "s|$PROJECT_DIR/|   |"
