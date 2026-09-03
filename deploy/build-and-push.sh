#!/usr/bin/env bash
# Build and push the production backend image. Run from WSL.
#
# Usage:
#   deploy/build-and-push.sh [tag]
#
# tag defaults to "latest". Requires `docker login` to have been run already
# for the ravinadh Docker Hub account.
set -euo pipefail

cd "$(dirname "$0")/.."

TAG="${1:-latest}"
IMAGE="ravinadh/ksquare-idp:${TAG}"

echo "==> Installing dependencies"
yarn install --immutable

echo "==> Type-checking"
yarn tsc

echo "==> Building frontend + backend"
yarn build:backend

echo "==> Building Docker image: ${IMAGE}"
docker build -f packages/backend/Dockerfile -t "${IMAGE}" .

echo "==> Pushing Docker image: ${IMAGE}"
docker push "${IMAGE}"

echo "==> Done: ${IMAGE}"
