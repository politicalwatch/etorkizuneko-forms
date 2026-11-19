#!/usr/bin/env bash
#
# Turns an After Effects PNG sequence (RGBA) into the frames StageVisual plays:
# one AVIF per distinct image in public/stage/<name>/, and a manifest in
# app/assets/stage/<name>.json mapping every frame of the sequence (60 fps) to
# its image. AE renders some layers at a lower frame rate, so consecutive
# frames often repeat: each repeated image is stored once.
#
# Usage: scripts/stage-frames.sh <png-dir> <name> [quality]
#   e.g. scripts/stage-frames.sh ~/Downloads/sequence-full-2x abstract-blob
# Needs avifenc (brew install libavif). quality: avifenc -q, 0–100, default 60.
set -euo pipefail

src=${1:?png directory}
name=${2:?name}
quality=${3:-60}

root=$(cd "$(dirname "$0")/.." && pwd)
out="$root/public/stage/$name"
manifest="$root/app/assets/stage/$name.json"

rm -rf "$out"
mkdir -p "$out" "$(dirname "$manifest")"

frames=()
prev_hash=''
count=0
size=''
for png in "$src"/*.png; do
  hash=$(shasum "$png" | cut -d' ' -f1)
  if [[ $hash != "$prev_hash" ]]; then
    file=$(printf '%03d' "$count")
    avifenc -q "$quality" -s 6 "$png" "$out/$file.avif" > /dev/null
    count=$((count + 1))
    prev_hash=$hash
  fi
  frames+=("$((count - 1))")
  [[ -n $size ]] || size=$(file "$png" | sed -E 's/.* ([0-9]+) x [0-9]+.*/\1/')
done

printf '{\n  "size": %s,\n  "fps": 60,\n  "frames": [%s]\n}\n' \
  "$size" "$(IFS=,; echo "${frames[*]}")" > "$manifest"

bytes=$(cat "$out"/*.avif | wc -c)
echo "${#frames[@]} frames → $count images, $((bytes / 1024)) KB in public/stage/$name"
