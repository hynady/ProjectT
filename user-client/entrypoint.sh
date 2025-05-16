#!/bin/sh

# This script generates the runtime environment configuration
# It reads environment variables from the container and creates a JS file
# that exposes them to the frontend application

# Output file location
OUTPUT_DIR=/usr/share/nginx/html
OUTPUT_FILE=${OUTPUT_DIR}/env-config.js

# Ensure the output directory exists
mkdir -p ${OUTPUT_DIR}

# Generate the environment configuration
echo "window.__ENV = {" > ${OUTPUT_FILE}
echo "  VITE_API_BASE_URL: \"${VITE_API_BASE_URL:-'/v1'}\","  >> ${OUTPUT_FILE}
echo "  VITE_WS_BASE_URL: \"${VITE_WS_BASE_URL:-'/ws'}\","  >> ${OUTPUT_FILE}
echo "  VITE_GOOGLE_MAPS_API_KEY: \"${VITE_GOOGLE_MAPS_API_KEY:-''}\","  >> ${OUTPUT_FILE}
echo "  VITE_ENABLE_MOCK: \"${VITE_ENABLE_MOCK:-'false'}\","  >> ${OUTPUT_FILE}
echo "  VITE_CLOUDINARY_CLOUD_NAME: \"${VITE_CLOUDINARY_CLOUD_NAME:-''}\","  >> ${OUTPUT_FILE}
echo "  VITE_CLOUDINARY_UPLOAD_PRESET: \"${VITE_CLOUDINARY_UPLOAD_PRESET:-''}\","  >> ${OUTPUT_FILE}
echo "  VITE_CLOUDINARY_API_KEY: \"${VITE_CLOUDINARY_API_KEY:-''}\""  >> ${OUTPUT_FILE}
echo "};" >> ${OUTPUT_FILE}

echo "Environment configuration generated at ${OUTPUT_FILE}"

# Execute the next command
exec "$@"
