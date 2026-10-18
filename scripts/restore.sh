#!/usr/bin/env bash
#
# Restauración de un respaldo generado por backup.sh.
# Por seguridad, restaura en la base "<DB_NAME>_restore" para no sobrescribir la original.
#
# Uso: ./scripts/restore.sh resguardos_tpi/2026-10-17_15-30-00
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"

RESTORE_DIR="${1:?Uso: $0 <carpeta-del-resguardo>}"
[[ -d "$RESTORE_DIR" ]] || { echo "No existe la carpeta '$RESTORE_DIR'."; exit 1; }

load_env_var() {
  local key="$1"
  if [[ -n "${!key:-}" ]]; then return 0; fi
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
TARGET_DB="${DB_NAME}_restore"

echo "==> Restaurando '$RESTORE_DIR' en la base '$TARGET_DB'"
mongorestore --uri="$MONGO_URI" \
  --nsFrom="${DB_NAME}.*" --nsTo="${TARGET_DB}.*" \
  "$RESTORE_DIR"

echo "==> Restauración finalizada en '$TARGET_DB'."
