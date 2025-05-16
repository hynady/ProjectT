#!/bin/bash

echo "Creating .env.production file for local development"

cat > ./user-client/.env.production << EOL
VITE_API_BASE_URL=/v1
VITE_WS_BASE_URL=/ws
VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}
VITE_ENABLE_MOCK=${VITE_ENABLE_MOCK}
VITE_CLOUDINARY_CLOUD_NAME=${VITE_CLOUDINARY_CLOUD_NAME}
VITE_CLOUDINARY_UPLOAD_PRESET=${VITE_CLOUDINARY_UPLOAD_PRESET}
VITE_CLOUDINARY_API_KEY=${VITE_CLOUDINARY_API_KEY}
EOL

echo ".env.production file created successfully for local development"
echo "Remember this file is only used for local development"
echo "When deploying with docker, environment variables will be injected at runtime"
'
'