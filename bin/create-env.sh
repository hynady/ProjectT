#!/bin/bash
# This script helps you create a .env file from the .env.template

# Get the project root directory (parent of bin)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "Creating .env file from template..."

if [ -f .env ]; then
    echo "Warning: .env file already exists!"
    read -p "Do you want to overwrite it? (y/n): " OVERWRITE
    if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 1
    fi
fi

cp .env.template .env
echo ".env file created successfully!"
echo
echo "IMPORTANT: Please edit the .env file and replace all placeholder values"
echo "with your actual production values before deploying."
echo
echo "You can use a text editor like VS Code to edit the file:"
echo "code $PROJECT_ROOT/.env"
echo

# Generate a random JWT secret as an example
JWT_SECRET=$(openssl rand -base64 64 2>/dev/null || head -c 64 /dev/urandom | base64)
echo "Here's a randomly generated JWT secret you can use:"
echo "$JWT_SECRET"
echo
echo "Remember to update all other values in the .env file as well!"
