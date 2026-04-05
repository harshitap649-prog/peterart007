#!/bin/bash

echo "🚀 Deploying to Vercel..."

# Clean build
echo "📦 Cleaning previous build..."
rm -rf .next

# Install dependencies (including PWA)
echo "📥 Installing dependencies..."
npm ci

# Use Vercel-specific config for deployment (without PWA)
echo "🔧 Using Vercel-optimized config..."
cp next.config.vercel.js next.config.js

# Build with verbose output
echo "🔨 Building with verbose output..."
NODE_ENV=production npm run build

# Check build status
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Deploying to Vercel..."
    npx vercel --prod
else
    echo "❌ Build failed!"
    echo "🔧 Trying fallback without PWA..."
    
    # Fallback: Try with original config but without PWA
    git checkout next.config.js
    NODE_ENV=production npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Fallback build successful!"
        echo "🚀 Deploying to Vercel..."
        npx vercel --prod
    else
        echo "❌ Both builds failed!"
        exit 1
    fi
fi

# Restore original config after build
echo "🔄 Restoring original config..."
git checkout next.config.js
