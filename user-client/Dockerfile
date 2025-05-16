# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package.json .
COPY package-lock.json* .
RUN npm ci

# Copy source files
COPY . .

# Build the application
# Note: We're not including environment variables at build time
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Create a directory for our environment configuration script
COPY entrypoint.sh /docker-entrypoint.d/30-env-config.sh
RUN chmod +x /docker-entrypoint.d/30-env-config.sh

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Tạo debug log
RUN mkdir -p /var/log/nginx
RUN touch /var/log/nginx/debug.log
RUN chmod 644 /var/log/nginx/debug.log

# Define environment variables with defaults for local development
ENV VITE_API_BASE_URL=/v1 \
    VITE_WS_BASE_URL=/ws \
    VITE_ENABLE_MOCK=false \
    VITE_GOOGLE_MAPS_API_KEY="" \
    VITE_CLOUDINARY_CLOUD_NAME="" \
    VITE_CLOUDINARY_UPLOAD_PRESET="" \
    VITE_CLOUDINARY_API_KEY=""

EXPOSE 80

# Use the default entrypoint of nginx which will run our script
CMD ["nginx", "-g", "daemon off;"]
