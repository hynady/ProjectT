#!/bin/bash
# ===================================================
# Utility script to list all available commands
# ===================================================

# Get the project root directory (parent of bin)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "==================================================="
echo "TackTicket Project Management Utilities"
echo "==================================================="
echo
echo "Available commands:"
echo
echo "1. Initial Setup:"
echo "   - bin/create-env.sh         : Create .env file from template"
echo
echo "2. Deployment:"
echo "   - bin/deploy.sh             : Build and deploy all services"
echo
echo "3. Maintenance:"
echo "   - (Use docker-compose commands directly for maintenance on Linux)"
echo
echo "==================================================="
