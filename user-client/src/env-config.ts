// This file provides environment variables at runtime
// Environment variables are injected by the container when it starts

// Expose our environment configuration to the window object
declare global {
  interface Window {
    __ENV: {
      VITE_API_BASE_URL: string;
      VITE_WS_BASE_URL: string;
      VITE_GOOGLE_MAPS_API_KEY: string;
      VITE_ENABLE_MOCK: string;
      VITE_CLOUDINARY_CLOUD_NAME: string;
      VITE_CLOUDINARY_UPLOAD_PRESET: string;
      VITE_CLOUDINARY_API_KEY: string;
      [key: string]: string;
    };
  }
}

// Default values (will be overridden by window.__ENV in production)
const defaultEnv = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  VITE_WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || '',
  VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  VITE_ENABLE_MOCK: import.meta.env.VITE_ENABLE_MOCK || 'false',
  VITE_CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  VITE_CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  VITE_CLOUDINARY_API_KEY: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
};

// Use window.__ENV in production, or import.meta.env in development
export const env = (typeof window !== 'undefined' && window.__ENV) || defaultEnv;

export default env;
