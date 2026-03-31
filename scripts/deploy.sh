#!/usr/bin/env bash
set -e

echo "==> Pulling latest..."
git pull

echo "==> Restarting containers..."
docker compose up -d --build

echo "==> Done."
