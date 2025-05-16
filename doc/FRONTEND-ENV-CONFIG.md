# Frontend Environment Variable Configuration

This project uses runtime environment variables for flexibility between development and deployment. This allows you to configure the application without rebuilding the Docker image.

## Environment Variables

The frontend uses the following environment variables:

- `VITE_API_BASE_URL`: Base URL for API requests (e.g., `/v1`)
- `VITE_WS_BASE_URL`: Base URL for WebSocket connections (e.g., `/ws`)
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key for location features
- `VITE_ENABLE_MOCK`: Enable/disable mock data (`true`/`false`)
- `VITE_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name for image uploads
- `VITE_CLOUDINARY_UPLOAD_PRESET`: Cloudinary upload preset
- `VITE_CLOUDINARY_API_KEY`: Cloudinary API key

## Local Development

For local development, you can create a `.env.production` file in the user-client directory with your environment variables. You can use the provided script:

```bash
# On Windows
bin/create-frontend-env.cmd

# On Linux/Mac
bin/create-frontend-env.sh
```

## Docker Deployment

When running in Docker, environment variables are injected at runtime. You don't need to rebuild the image to change these values.

### How it works:

1. The Dockerfile includes default values for environment variables
2. Docker Compose overrides these with values from your `.env` file
3. At container startup, an entrypoint script generates `env-config.js` with current values
4. The frontend application loads this file at runtime

This allows you to:
- Update environment variables without rebuilding the image
- Use different configurations in different environments
- Keep sensitive values out of the image

## Troubleshooting

If environment variables aren't being applied:
1. Check that your Docker container has access to the variables
2. Verify that `env-config.js` is being generated correctly in the container
3. Clear browser cache to ensure you're loading the latest configuration
