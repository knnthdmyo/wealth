#!/bin/bash

# Script to clean up the closed AI-generated PR branch
# This script should be run by a user with push access to the repository

set -e

echo "🧹 Cleanup Script for Closed AI PR Branch"
echo "=========================================="
echo ""

BRANCH_NAME="copilot/update-profile-dashboard"
REMOTE="origin"

# Check if branch exists on remote
echo "📡 Checking if branch exists on remote..."
if git ls-remote --heads "$REMOTE" | grep -q "refs/heads/$BRANCH_NAME"; then
    echo "✅ Branch '$BRANCH_NAME' found on remote"
    
    # Ask for confirmation
    read -p "⚠️  Do you want to delete the remote branch '$BRANCH_NAME'? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Deleting remote branch..."
        git push "$REMOTE" --delete "$BRANCH_NAME"
        echo "✅ Remote branch deleted successfully"
    else
        echo "❌ Deletion cancelled"
        exit 0
    fi
else
    echo "ℹ️  Branch '$BRANCH_NAME' not found on remote (may already be deleted)"
fi

# Check if branch exists locally
echo ""
echo "📁 Checking if branch exists locally..."
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo "✅ Local branch found"
    
    # Check if we're currently on this branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" = "$BRANCH_NAME" ]; then
        echo "⚠️  You are currently on branch '$BRANCH_NAME'"
        echo "   Switching to master branch..."
        git checkout master
    fi
    
    echo "🗑️  Deleting local branch..."
    git branch -D "$BRANCH_NAME"
    echo "✅ Local branch deleted"
else
    echo "ℹ️  Local branch not found (may already be deleted)"
fi

# Prune remote tracking branches
echo ""
echo "🔄 Pruning remote tracking branches..."
git fetch --prune "$REMOTE"
echo "✅ Remote tracking branches pruned"

# Verify cleanup
echo ""
echo "🔍 Verifying cleanup..."
if git ls-remote --heads "$REMOTE" | grep -q "refs/heads/$BRANCH_NAME"; then
    echo "⚠️  Branch still exists on remote"
else
    echo "✅ Remote branch successfully removed"
fi

if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo "⚠️  Local branch still exists"
else
    echo "✅ Local branch successfully removed"
fi

echo ""
echo "🎉 Cleanup complete!"
echo ""
echo "Note: PR #1 will remain visible in GitHub's closed PRs (this is expected behavior)"
