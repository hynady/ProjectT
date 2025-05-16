/**
 * Utilities for handling Cloudinary image uploads.
 */

// Types for Cloudinary response
export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  original_filename: string;
  resource_type: string;
  url: string;
  asset_id?: string;
  created_at?: string;
  [key: string]: string | number | undefined; // For any other Cloudinary response properties
}

/**
 * Initialize Cloudinary instance with configuration from environment variables
 */
import { env } from '@/env-config';

export function getCloudinaryInstance() {
  const cloudName = env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
  
  return {
    cloudName
  };
}

/**
 * Uploads an image file to Cloudinary
 * 
 * @param imageFile - File object to upload
 * @param folder - Optional folder name in Cloudinary where the image will be stored
 * @returns Promise resolving to the Cloudinary response with image URLs
 */
export async function uploadImageToCloudinary(
  imageFile: File,
  folder: string = 'general'
): Promise<CloudinaryResponse> {  // Cloudinary cloud name and upload preset from environment variables
  const cloudName = env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
  if (!cloudName || !uploadPreset) {
    console.error("Cloudinary configuration missing");
    throw new Error("Cloudinary configuration missing");
  }
  
  // Create form data for the upload
  const formData = new FormData();
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  formData.append('file', imageFile);
  
  try {
    console.log(`Uploading file "${imageFile.name}" to Cloudinary folder "${folder}"...`);
    
    // Use the Cloudinary upload endpoint
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary upload failed:", errorData);
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || "Unknown error"}`);
    }
    
    const data = await response.json();
    console.log(`Upload successful for "${imageFile.name}". URL: ${data.secure_url}`);
    
    return data;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error(
      error instanceof Error 
        ? `Lỗi tải lên ảnh: ${error.message}` 
        : "Không thể tải lên ảnh, vui lòng thử lại"
    );
  }
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
  
  const { cloudName } = getCloudinaryInstance();
  let url = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  // Apply transformations if provided
  if (options) {
    const transformations = [];
    
    if (options.width) {
      transformations.push(`w_${options.width}`);
    }
    
    if (options.height) {
      transformations.push(`h_${options.height}`);
    }
    
    if (options.crop) {
      transformations.push(`c_${options.crop}`);
    } else if (options.width || options.height) {
      transformations.push('c_fill');
    }
    
    if (options.quality) {
      transformations.push(`q_${options.quality}`);
    }
    
    if (transformations.length > 0) {
      url += `/${transformations.join(',')}`;
    }
  }
  
  // Add the public ID
  url += `/${publicId}`;
  
  return url;
}

/**
 * Helper function to determine if a URL is from Cloudinary
 * @param url URL to check
 * @returns boolean indicating if the URL is from Cloudinary
 */
export const isCloudinaryUrl = (url: string): boolean => {
  if (!url) return false;
  // Check if URL is from Cloudinary (contains cloudinary.com)
  return url.includes('cloudinary.com/');
};

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

/**
 * Updates preview images in the form data with the Cloudinary URLs
 * @param formData The form data containing preview images
 * @param cloudinaryUrls Object mapping preview URLs to Cloudinary URLs
 * @returns Updated form data with Cloudinary URLs
 */
export const updatePreviewsWithCloudinaryUrls = <T extends Record<string, unknown>>(
  formData: T,
  cloudinaryUrls: Record<string, string>
): T => {
  // Deep clone the form data
  const updatedFormData = JSON.parse(JSON.stringify(formData)) as T;
  
  // Update URLs in the form data
  for (const [previewUrl, cloudinaryUrl] of Object.entries(cloudinaryUrls)) {
    // Replace any occurrences of the preview URL with the Cloudinary URL
    const updateObject = (obj: Record<string, unknown>) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string' && obj[key] === previewUrl) {
          obj[key] = cloudinaryUrl;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          updateObject(obj[key] as Record<string, unknown>);
        }
      }
    };
    
    updateObject(updatedFormData);
  }
  
  return updatedFormData;
};

/**
 * Utility function to generate an avatar URL with initials if no image is available
 * 
 * @param name - User name for generating initials
 * @param avatarUrl - Optional existing avatar URL
 * @returns URL to user avatar (either actual image or generated with initials)
 */
export function getAvatarUrl(name: string = '', avatarUrl?: string): string {
  if (avatarUrl) return avatarUrl;
  
  // Ensure name is a string
  const nameStr = name || '';
  
  // Generate a UI Avatar URL with the user's initials
  const initials = nameStr
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'U';
  
  // Use UI Avatars to generate an avatar with initials
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=256`;
}
