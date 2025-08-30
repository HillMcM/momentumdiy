#!/bin/bash

echo "🚀 Starting ClientPortalApp in development mode..."
echo ""
echo "This will start:"
echo "  - Frontend server on http://localhost:5173"
echo "  - Mock data will be used (no backend required)"
echo ""

# Change to Frontend directory and start the dev server
cd Frontend
npm run dev
