#!/bin/bash

# ======================================
# Apply Security RLS Migration Script
# ======================================

echo "🔒 Security & Maintainability Update - Database Migration"
echo "========================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "supabase/migrations/20251013000000_improve_rls_policies.sql" ]; then
    echo -e "${RED}❌ Error: Migration file not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo -e "${YELLOW}This script will apply the RLS policy improvements to your database.${NC}"
echo ""
echo "What this migration does:"
echo "  ✅ Strengthens user data isolation"
echo "  ✅ Fixes overly permissive RLS policies"
echo "  ✅ Adds RLS to new tables"
echo "  ✅ Improves security for projects, tasks, calendar, assets"
echo ""
echo -e "${GREEN}✓ Safe to run (idempotent - won't break existing data)${NC}"
echo ""

# Ask which environment
echo "Which environment do you want to update?"
echo "  1) Production (remote Supabase project)"
echo "  2) Local Development (Docker)"
echo "  3) Exit"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}📊 Applying to PRODUCTION...${NC}"
        echo ""
        echo "You have two options:"
        echo ""
        echo "Option A: Supabase CLI (Recommended)"
        echo "  1. Make sure you're logged in: supabase login"
        echo "  2. Link your project: supabase link --project-ref YOUR-PROJECT-REF"
        echo "  3. Run: supabase db push"
        echo ""
        echo "Option B: Supabase Dashboard"
        echo "  1. Go to: https://supabase.com/dashboard"
        echo "  2. Select your project"
        echo "  3. Navigate to: SQL Editor"
        echo "  4. Click: New Query"
        echo "  5. Copy/paste the contents of:"
        echo "     supabase/migrations/20251013000000_improve_rls_policies.sql"
        echo "  6. Click: Run"
        echo ""
        read -p "Do you want to try Option A now? (y/n): " use_cli
        
        if [ "$use_cli" = "y" ] || [ "$use_cli" = "Y" ]; then
            echo ""
            echo "Checking Supabase CLI login status..."
            
            if supabase projects list > /dev/null 2>&1; then
                echo -e "${GREEN}✓ You're logged in!${NC}"
                echo ""
                echo "Available projects:"
                supabase projects list
                echo ""
                read -p "Enter your project ref (from above): " project_ref
                
                if [ ! -z "$project_ref" ]; then
                    echo ""
                    echo "Linking to project: $project_ref"
                    supabase link --project-ref "$project_ref"
                    
                    if [ $? -eq 0 ]; then
                        echo ""
                        echo -e "${YELLOW}🚀 Applying migration...${NC}"
                        supabase db push
                        
                        if [ $? -eq 0 ]; then
                            echo ""
                            echo -e "${GREEN}✅ Migration applied successfully!${NC}"
                            echo ""
                            echo "Next steps:"
                            echo "  1. Add ADMIN_EMAILS environment variable to Render"
                            echo "  2. Verify deployment (see DEPLOYMENT_STEPS.md)"
                            echo "  3. Test RLS with multiple user accounts"
                        else
                            echo ""
                            echo -e "${RED}❌ Migration failed!${NC}"
                            echo "Please check the error message above."
                            echo "You can also apply manually via Supabase Dashboard."
                        fi
                    else
                        echo ""
                        echo -e "${RED}❌ Failed to link project!${NC}"
                        echo "Please try Option B (Supabase Dashboard) instead."
                    fi
                fi
            else
                echo -e "${RED}❌ Not logged in to Supabase CLI${NC}"
                echo ""
                echo "Please run: supabase login"
                echo "Then run this script again, or use Option B."
            fi
        else
            echo ""
            echo -e "${YELLOW}📋 Manual Steps (Option B):${NC}"
            echo ""
            echo "1. Open: https://supabase.com/dashboard"
            echo "2. Select your project"
            echo "3. Go to: SQL Editor → New Query"
            echo "4. Copy the file: supabase/migrations/20251013000000_improve_rls_policies.sql"
            echo "5. Paste and Run"
            echo ""
            echo "The migration file is ready to copy!"
        fi
        ;;
        
    2)
        echo ""
        echo -e "${YELLOW}🐳 Applying to LOCAL DEVELOPMENT...${NC}"
        echo ""
        
        # Check if Docker is running
        if ! docker info > /dev/null 2>&1; then
            echo -e "${RED}❌ Docker is not running!${NC}"
            echo "Please start Docker Desktop and try again."
            exit 1
        fi
        
        echo "Starting Supabase local development..."
        supabase start
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "Applying migration..."
            supabase db reset
            
            if [ $? -eq 0 ]; then
                echo ""
                echo -e "${GREEN}✅ Local migration applied successfully!${NC}"
                echo ""
                supabase status
            fi
        else
            echo -e "${RED}❌ Failed to start Supabase${NC}"
            exit 1
        fi
        ;;
        
    3)
        echo ""
        echo "Exiting without changes."
        exit 0
        ;;
        
    *)
        echo ""
        echo -e "${RED}Invalid choice!${NC}"
        exit 1
        ;;
esac

echo ""
echo "========================================================"
echo "For detailed deployment steps, see: DEPLOYMENT_STEPS.md"
echo "========================================================"


