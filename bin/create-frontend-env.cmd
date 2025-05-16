@echo off
echo Creating .env.production file for local development

echo VITE_API_BASE_URL=/v1> ./user-client/.env.production
echo VITE_WS_BASE_URL=/ws>> ./user-client/.env.production
echo VITE_GOOGLE_MAPS_API_KEY=%VITE_GOOGLE_MAPS_API_KEY%>> ./user-client/.env.production
echo VITE_ENABLE_MOCK=%VITE_ENABLE_MOCK%>> ./user-client/.env.production
echo VITE_CLOUDINARY_CLOUD_NAME=%VITE_CLOUDINARY_CLOUD_NAME%>> ./user-client/.env.production
echo VITE_CLOUDINARY_UPLOAD_PRESET=%VITE_CLOUDINARY_UPLOAD_PRESET%>> ./user-client/.env.production
echo VITE_CLOUDINARY_API_KEY=%VITE_CLOUDINARY_API_KEY%>> ./user-client/.env.production

echo .env.production file created successfully for local development
echo Remember this file is only used for local development
echo When deploying with docker, environment variables will be injected at runtime
