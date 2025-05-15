#!/bin/bash

# Get the project root directory (parent of bin)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please create a .env file based on the .env.template file."
    exit 1
fi

# Build Spring Boot application
echo "Building Spring Boot application..."
cd server-mono
./gradlew build -x test
cd "$PROJECT_ROOT"

# Start the services
echo "Starting services..."
docker-compose -f docker-compose.production.yml up -d

# Check if services are running
echo "Checking services..."
docker-compose -f docker-compose.production.yml ps

echo "Deployment completed!"
echo "Frontend: http://localhost:30000"
echo "Backend API: http://localhost:8080"
echo "MySQL: localhost:33306"
echo "Kafka: localhost:29092"
