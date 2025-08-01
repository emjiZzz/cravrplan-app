#!/bin/bash

# Set git pager to cat to avoid terminal issues
export GIT_PAGER=cat

echo "Current branch:"
git branch --show-current

echo ""
echo "Current status:"
git status

echo ""
echo "Adding all changes..."
git add .

echo ""
echo "Committing changes..."
git commit -m "Update feature/general-improvements with all implemented features"

echo ""
echo "Current commit history:"
git log --oneline -5

echo ""
echo "Done! All changes have been committed to feature/general-improvements branch." 