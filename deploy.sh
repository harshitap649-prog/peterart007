#!/bin/bash

# Deployment Script for Peter Art
# This script helps you deploy to GitHub and Render

echo "🚀 Peter Art Deployment Script"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Initializing..."
    git init
    git branch -M main
fi

# Check git status
echo "📋 Checking git status..."
git status

echo ""
echo "Do you want to commit and push all changes? (y/n)"
read -r response

if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
    echo ""
    echo "📦 Adding all changes..."
    git add .
    
    echo ""
    echo "💾 Committing changes..."
    git commit -m "Deploy: Updated artwork functionality and UI improvements"
    
    echo ""
    echo "🔍 Checking remote repository..."
    if ! git remote | grep -q "origin"; then
        echo "⚠️  No remote repository found!"
        echo "Please add your GitHub repository:"
        echo "  git remote add origin https://github.com/YOUR_USERNAME/peterart007.git"
        exit 1
    fi
    
    echo ""
    echo "📤 Pushing to GitHub..."
    git push origin main
    
    echo ""
    echo "✅ Code pushed to GitHub successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Go to https://render.com"
    echo "2. Create a new Web Service"
    echo "3. Connect your GitHub repository"
    echo "4. Render will auto-detect render.yaml"
    echo "5. Add environment variables (see DEPLOYMENT_GUIDE.md)"
    echo "6. Deploy!"
    echo ""
    echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
else
    echo "❌ Deployment cancelled."
fi

