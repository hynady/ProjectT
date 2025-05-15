#!/bin/bash
# Make all shell scripts in the bin directory executable

# Get the project root directory (parent of this file)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "Making bin scripts executable..."
chmod +x bin/*.sh
echo "Done!"
