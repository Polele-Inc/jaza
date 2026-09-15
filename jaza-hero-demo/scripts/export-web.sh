#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_LANDING="${WEB_LANDING:-$ROOT/../../jaza-web/public/landing}"
OUT="$ROOT/out"
ENTRY="src/index.ts"

cd "$ROOT"
mkdir -p "$OUT"

echo "→ Rendering WebM (VP9 + alpha, 0.5 scale)…"
npx remotion render "$ENTRY" TopUpDemo "$OUT/topup-demo.webm" \
  --codec=vp9 \
  --image-format=png \
  --pixel-format=yuva420p \
  --scale=0.5

echo "→ Rendering poster…"
npx remotion still "$ENTRY" TopUpDemo "$OUT/topup-demo-poster.png" \
  --frame=20 \
  --image-format=png \
  --scale=0.5

echo "→ Rendering PNG sequence for WebP (every 2nd frame)…"
SEQ="$OUT/frames"
rm -rf "$SEQ"
mkdir -p "$SEQ"
npx remotion render "$ENTRY" TopUpDemo "$SEQ" \
  --sequence \
  --image-format=png \
  --scale=0.45 \
  --every-nth-frame=2

echo "→ Packing animated WebP…"
ROOT="$ROOT" python3 <<'PY'
import os
from pathlib import Path
from PIL import Image

root = Path(os.environ["ROOT"])
seq = root / "out" / "frames"
paths = sorted(seq.glob("*.png"))
if not paths:
    raise SystemExit(f"no frames in {seq}")
print(f"packing {len(paths)} frames")
imgs = [Image.open(p).convert("RGBA") for p in paths]
out = root / "out" / "topup-demo.webp"
imgs[0].save(
    out,
    format="WEBP",
    save_all=True,
    append_images=imgs[1:],
    duration=67,
    loop=0,
    quality=72,
    method=4,
)
print("wrote", out, f"({round(out.stat().st_size/1024)} KB)")
PY

mkdir -p "$WEB_LANDING"
cp -f "$OUT/topup-demo.webm" "$WEB_LANDING/topup-demo.webm"
cp -f "$OUT/topup-demo-poster.png" "$WEB_LANDING/topup-demo-poster.png"
cp -f "$OUT/topup-demo.webp" "$WEB_LANDING/topup-demo.webp"

ls -lh "$WEB_LANDING"/topup-demo.*
echo "✓ Exported to $WEB_LANDING"
