#!/usr/bin/env bash
# Run backend (Express) and admin (Next.js) together from the repo root.
set -euo pipefail
cd "$(dirname "$0")/.."
exec npm run dev
