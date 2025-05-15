# ProjectT Production Deployment

This directory contains configuration files for deploying ProjectT in a production environment using Docker.

## Components

The deployment includes the following components:
- Frontend: React Vite application
- Backend: Spring Boot application
- Database: MySQL
- Message Queue: Kafka with Zookeeper

## Security Features

- Secret management through environment variables (not committed to version control)
- Network isolation using Docker networks
- Database security with proper user permissions
- Secure Nginx configuration for the frontend
- Configurable CORS settings to prevent unauthorized cross-origin requests
- Resource limits to prevent DoS attacks
- Health checks for service monitoring

## Prerequisites

- Docker and Docker Compose installed
- Gradle for building the Spring Boot application
- Node.js/npm for local development

## Deployment Instructions

### 1. Set up environment variables

Create a `.env` file in the root directory based on the provided `.env.template`:

```bash
cp .env.template .env
```

Edit the `.env` file and replace all placeholder values with your actual production values. Be sure to use strong passwords and secrets.

**Important:** The `.env` file includes environment variables for both backend and frontend. For React Vite, environment variables are injected at build time, so they must be defined in the `.env` file before building the Docker images.

#### CORS Configuration

The `FRONTEND_URL` environment variable controls which origins are allowed to make cross-origin requests to the backend API. In production, set this to the full URL where your frontend is accessible to users. For example:

```
FRONTEND_URL=https://tackticket.com
```

If you have multiple domains that need to access the API, you'll need to modify the WebConfig.java file to support multiple origins.

### 2. Deploy using the script

#### On Linux/macOS:
```bash
chmod +x deploy.sh
./deploy.sh
```

#### On Windows:
```cmd
deploy.cmd
```

### 3. Verify deployment

After deployment, you can access:
- Frontend: http://localhost:30000
- Backend API: http://localhost:8080
- MySQL (if needed): localhost:33306
- Kafka (if needed): localhost:29092

## Important Notes

- The `.env` file contains sensitive information and should NEVER be committed to version control
- For actual production use, consider using Docker Swarm or Kubernetes for orchestration
- Set up proper SSL certificates for production use
- Regularly update dependencies and Docker images for security

## Frontend Environment Variables

The React Vite frontend uses environment variables with the `VITE_` prefix. These variables are:

- `VITE_API_BASE_URL`: Backend API URL
- `VITE_WS_BASE_URL`: WebSocket URL
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API Key
- `VITE_ENABLE_MOCK`: Enable/disable mock API
- `VITE_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `VITE_CLOUDINARY_UPLOAD_PRESET`: Cloudinary upload preset
- `VITE_CLOUDINARY_API_KEY`: Cloudinary API key

These variables are injected into the frontend container during the build process.

## Maintenance

### Stopping the services
```bash
docker-compose -f docker-compose.production.yml down
```

### Viewing logs
```bash
docker-compose -f docker-compose.production.yml logs -f
```

### Scaling services (if needed)
```bash
docker-compose -f docker-compose.production.yml up -d --scale backend=3
```
