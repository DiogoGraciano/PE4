#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

CSL="${HOME}/.local/share/pandoc/csl/abnt.csl"
TEMPLATE="template-esucri.docx"
SRC="Nexo-Documentacao.md"
OUT="Nexo-Documentacao.docx"

if ! command -v pandoc >/dev/null 2>&1; then
  echo "ERRO: pandoc nao instalado. Rode: sudo pacman -S --noconfirm pandoc-cli" >&2
  exit 1
fi

if [ ! -f "$CSL" ]; then
  echo "ERRO: CSL ABNT nao encontrado em $CSL" >&2
  echo "Rode:" >&2
  echo "  mkdir -p ~/.local/share/pandoc/csl" >&2
  echo "  curl -fsSL -o $CSL https://raw.githubusercontent.com/citation-style-language/styles/master/associacao-brasileira-de-normas-tecnicas.csl" >&2
  exit 1
fi

REF_ARG=()
if [ -f "$TEMPLATE" ]; then
  REF_ARG=(--reference-doc="$TEMPLATE")
  echo "Usando --reference-doc=$TEMPLATE"
else
  echo "AVISO: $TEMPLATE nao encontrado. Gerando com estilos padrao do Pandoc."
  echo "       Coloque o template em docs/$TEMPLATE e rode novamente para preservar o cabecalho ESUCRI."
fi

pandoc "$SRC" \
  "${REF_ARG[@]}" \
  --citeproc \
  --csl="$CSL" \
  --bibliography=referencias.bib \
  --toc --toc-depth=2 \
  --number-sections \
  --metadata lang=pt-BR \
  -o "$OUT"

echo "OK: $(pwd)/$OUT"
ls -lh "$OUT"
