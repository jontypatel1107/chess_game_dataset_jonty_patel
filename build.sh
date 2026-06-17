#!/bin/bash
set -e

echo "Building frontend..."
cd chess-frontend
npm install
npm run build
cd ..

echo "Frontend built successfully!"
