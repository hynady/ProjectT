# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package.json .
COPY package-lock.json* .
RUN npm ci

# Define build arguments that can be passed from docker-compose
ARG VITE_API_BASE_URL
ARG VITE_WS_BASE_URL
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_ENABLE_MOCK
ARG VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_CLOUDINARY_UPLOAD_PRESET
ARG VITE_CLOUDINARY_API_KEY

# Create .env file for build time env variables
RUN echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" > .env.production && \
    echo "VITE_WS_BASE_URL=$VITE_WS_BASE_URL" >> .env.production && \
    echo "VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY" >> .env.production && \
    echo "VITE_ENABLE_MOCK=$VITE_ENABLE_MOCK" >> .env.production && \
    echo "VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME" >> .env.production && \
    echo "VITE_CLOUDINARY_UPLOAD_PRESET=$VITE_CLOUDINARY_UPLOAD_PRESET" >> .env.production && \
    echo "VITE_CLOUDINARY_API_KEY=$VITE_CLOUDINARY_API_KEY" >> .env.production

COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Tạo debug log
RUN mkdir -p /var/log/nginx
RUN touch /var/log/nginx/debug.log
RUN chmod 644 /var/log/nginx/debug.log

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
