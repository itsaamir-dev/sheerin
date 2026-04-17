#!/bin/bash
# Sheerin — First-time setup script
# Usage: chmod +x setup.sh && ./setup.sh

set -e

echo ""
echo "🎂 Sheerin Setup"
echo "══════════════════════════════════════"

# 1. Check Node version
NODE_VER=$(node -v 2>/dev/null || echo "none")
if [ "$NODE_VER" = "none" ]; then
  echo "❌  Node.js not found. Please install Node.js 18+ first."
  exit 1
fi
echo "✅  Node.js $NODE_VER"

# 2. Copy .env if not exists
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "✅  Created .env from .env.example"
else
  echo "⚠️   .env already exists — skipping"
fi

# 3. Install dependencies
echo ""
echo "📦  Installing dependencies..."
npm install

# 4. Generate Prisma client + push schema
echo ""
echo "🗄️   Setting up database..."
npx prisma generate
npx prisma db push

# 5. Seed the database
echo ""
echo "🌱  Seeding database with sample data..."
npx tsx prisma/seed.ts

echo ""
echo "══════════════════════════════════════"
echo "✅  Setup complete!"
echo ""
echo "Run the dev server:"
echo "  npm run dev"
echo ""
echo "Then open:  http://localhost:3000"
echo "Admin:      http://localhost:3000/admin/login"
echo "  Email:    admin@sheerin.com"
echo "  Password: admin123"
echo ""
