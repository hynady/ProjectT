#!/bin/bash
# This script checks if the environment variables are correctly mounted in the container

echo "Checking environment variables in the frontend container..."

# Get the container ID
CONTAINER_ID=$(docker-compose ps -q frontend)

if [ -z "$CONTAINER_ID" ]; then
  echo "Frontend container is not running. Please start the containers first."
  exit 1
fi

echo "Container ID: $CONTAINER_ID"

# Check if env-config.js exists and show its contents
echo "Checking if env-config.js exists in the container..."
docker exec $CONTAINER_ID ls -la /usr/share/nginx/html/env-config.js

echo "Content of env-config.js:"
docker exec $CONTAINER_ID cat /usr/share/nginx/html/env-config.js

echo ""
echo "Environment variables test complete"
