#!/bin/bash
# Git commands to push AI agent system to momentumdiy repo

# Step 1: Clone momentumdiy repo (if not already)
cd /Users/hillmcm
git clone https://github.com/HillMcM/momentumdiy.git momentumdiy-admin-deploy
cd momentumdiy-admin-deploy

# Step 2: Create new branch
git checkout -b ai-agents

# Step 3: Create admin folder and copy AI system
mkdir -p admin
cd ..
cp -r n8n-business-automation/* momentumdiy-admin-deploy/admin/

# Step 4: Remove unnecessary files from admin folder
cd momentumdiy-admin-deploy/admin
rm -rf node_modules
rm -rf logs
rm -rf buffer-content
rm -f *.png
rm -f .DS_Store

# Step 5: Commit and push
cd ..
git add admin/
git status  # Review what's being added
git commit -m "Add AI agent admin system under /admin folder

- Smart content marketing system
- Weekly workflow automation
- 8 AI agents (CMO, Market Researcher, Copywriter, Social Content, etc.)
- Supabase integration for data storage
- Google Gemini for image prompts
- Buffer integration for social posting
- Approval workflow for content review"

git push -u origin ai-agents

echo "✅ Code pushed to GitHub!"
echo "Branch: ai-agents"
echo "Folder: /admin"
echo "Repo: https://github.com/HillMcM/momentumdiy"

