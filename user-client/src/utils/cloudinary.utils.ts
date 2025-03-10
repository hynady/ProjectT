/**
 * Utility for handling image uploads to Cloudinary using the official SDK
 */
import { Cloudinary } from '@cloudinary/url-gen';
import { CloudinaryImage } from '@cloudinary/url-gen/assets/CloudinaryImage';

export interface CloudinaryUploadResponse {
  secure_url: string;  // HTTPS URL of the uploaded image
  public_id: string;   // Public ID assigned by Cloudinary
  format: string;      // File format of the uploaded image
  width: number;       // Width of the uploaded image
  height: number;      // Height of the uploaded image
  resource_type: string; // Type of resource (image, video, etc.)
  created_at: string;  // Creation timestamp
  bytes: number;       // File size in bytes
  url: string;         // HTTP URL of the uploaded image
  asset_id: string;    // Asset ID in Cloudinary
}

/**
 * Initialize Cloudinary instance with configuration from environment variables
 */
export function getCloudinaryInstance(): Cloudinary {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
  
  return new Cloudinary({
    cloud: {
      cloudName
    }
  });
}

/**
 * Generate a Cloudinary image URL with transformations
 * 
 * @param publicId - Public ID of the image in Cloudinary
 * @param options - Optional transformation options
 * @returns URL to the transformed image
 */
export function getCloudinaryImageUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'thumb';
  quality?: number;
}): string {
  if (!publicId) return '';
  
  const cloudinary = getCloudinaryInstance();
  let image: CloudinaryImage = cloudinary.image(publicId);
  
  // Apply transformations if provided
  if (options) {
    if (options.width || options.height) {
      // Tạo đối tượng transformation với các giá trị đã được kiểm tra
      const transformation: Record<string, any> = {};
      
      if (options.width !== undefined) {
        transformation.width = options.width;
      }
      
      if (options.height !== undefined) {
        transformation.height = options.height;
      }
      
      if (options.crop) {
        transformation.crop = options.crop;
      } else if (options.width || options.height) {
        transformation.crop = 'fill'; // Default
      }
      
      // Áp dụng các biến đổi
      image = image.resize(transformation as any);
      
      if (options.quality) {
        image = image.quality(options.quality);
      }
    }
  }
  
  return image.toURL();
}

/**
 * Uploads an image file or base64 string to Cloudinary
 * 
 * @param imageData - File object or base64 encoded string of the image
 * @param folder - Optional folder name in Cloudinary where the image will be stored
 * @returns Promise resolving to the Cloudinary response with image URLs
 */
export async function uploadImageToCloudinary(
  imageData: File | string,
  folder: string = 'user_avatars'
): Promise<CloudinaryUploadResponse> {
  // Cloudinary cloud name and upload preset from environment variables
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
  const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
  
  // Create form data for the upload
  const formData = new FormData();
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);
  
  if (CLOUDINARY_API_KEY) {
    formData.append('api_key', CLOUDINARY_API_KEY);
  }
  
  // If imageData is a File, append it directly. If it's a base64 string, append it as 'file'
  if (typeof imageData === 'string' && imageData.startsWith('data:')) {
    formData.append('file', imageData);
  } else if (imageData instanceof File) {
    formData.append('file', imageData);
  } else {
    throw new Error('Invalid image data. Must be a File object or base64 encoded string.');
  }
  
  try {
    // Use the official Cloudinary upload endpoint
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload image');
  }
}

/**
 * Utility function to generate an avatar URL with initials if no image is available
 * 
 * @param name - User name for generating initials
 * @param avatarUrl - Optional existing avatar URL
 * @returns URL to user avatar (either actual image or generated with initials)
 */
export function getAvatarUrl(name: string = '', avatarUrl?: string): string {
  if (avatarUrl) return avatarUrl;
  
  // Generate a UI Avatar URL with the user's initials
  const initials = name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Use UI Avatars to generate an avatar with initials
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=256`;
}

/**
 * Extract public_id from a Cloudinary URL
 * 
 * @param url - Cloudinary URL
 * @returns The public_id of the image
 */
export function getPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }
  
  try {
    // Extract the path after '/upload/'
    const uploadPattern = /\/upload\/(?:v\d+\/)?([^/]+\/[^.]+)/;
    const match = url.match(uploadPattern);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}
