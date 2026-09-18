#!/usr/bin/env bash
set -euo pipefail

BUCKET="${R2_BUCKET:-studio-suzana-loroff}"
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="$RAIZ/src/assets"

if ! command -v wrangler >/dev/null && ! [[ -x "$RAIZ/node_modules/.bin/wrangler" ]]; then
  echo "Instale as deps: pnpm install" >&2
  exit 1
fi

WRANGLER=(pnpm exec wrangler)

echo "Criando bucket $BUCKET se ainda não existir..."
"${WRANGLER[@]}" r2 bucket create "$BUCKET" >/dev/null 2>&1 || true

find "$ASSETS" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) | while read -r arquivo; do
  chave="${arquivo#"$ASSETS"/}"
  echo "↑ $chave"
  "${WRANGLER[@]}" r2 object put "$BUCKET/$chave" --file "$arquivo" --remote --content-type "image/jpeg"
done

echo "Pronto. Objetos em r2://$BUCKET"
