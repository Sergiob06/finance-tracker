#!/bin/sh
set -e

cd /app

if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "Installing npm dependencies..."
  npm install
fi

exec npm run dev -- --host
