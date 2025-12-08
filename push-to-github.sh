#!/bin/bash

# CeloAfricaDAO Invoice App - GitHub Push Script
# This script helps you push your code to GitHub

echo "🚀 CeloAfricaDAO Invoice App - GitHub Push Helper"
echo "=================================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Error: Git repository not initialized"
    echo "Run: git init"
    exit 1
fi

# Check if there's a commit
if ! git rev-parse HEAD > /dev/null 2>&1; then
    echo "❌ Error: No commits found"
    echo "Your code has already been committed!"
    exit 1
fi

echo "✅ Git repository is ready"
echo ""

# Check if remote exists
if git remote | grep -q "origin"; then
    echo "✅ Remote 'origin' already configured:"
    git remote get-url origin
    echo ""
    read -p "Do you want to push to this remote? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Aborted."
        exit 0
    fi
else
    echo "📝 No remote configured. Let's add one!"
    echo ""
    echo "First, create a repository on GitHub:"
    echo "1. Go to https://github.com/new"
    echo "2. Create a new repository (don't initialize with README)"
    echo "3. Copy the repository URL"
    echo ""
    read -p "Enter your GitHub repository URL: " repo_url
    
    if [ -z "$repo_url" ]; then
        echo "❌ Error: No URL provided"
        exit 1
    fi
    
    echo ""
    echo "Adding remote..."
    git remote add origin "$repo_url"
    echo "✅ Remote added successfully!"
    echo ""
fi

# Show what will be pushed
echo "📦 Ready to push:"
echo "   Branch: main"
echo "   Commits: $(git rev-list --count HEAD)"
echo "   Files: $(git ls-files | wc -l)"
echo ""

read -p "Push to GitHub now? (y/n): " push_confirm

if [ "$push_confirm" = "y" ]; then
    echo ""
    echo "🚀 Pushing to GitHub..."
    echo ""
    
    if git push -u origin main; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo ""
        echo "🎉 Your code is now on GitHub!"
        echo ""
        echo "Next steps:"
        echo "1. Visit your repository on GitHub"
        echo "2. Add a description and topics"
        echo "3. Configure branch protection (optional)"
        echo "4. Set up CI/CD (optional)"
        echo ""
    else
        echo ""
        echo "❌ Push failed!"
        echo ""
        echo "Common issues:"
        echo "1. Authentication failed - Use a Personal Access Token"
        echo "2. Permission denied - Check repository access"
        echo "3. Remote rejected - Try: git pull origin main --rebase"
        echo ""
        echo "See GITHUB_PUSH_INSTRUCTIONS.md for detailed help"
    fi
else
    echo "Aborted. You can push manually with:"
    echo "   git push -u origin main"
fi
