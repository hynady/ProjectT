import { useState } from 'react';
import { uploadImageToCloudinary } from '@/utils/cloudinary.utils';
import { OccaFormData } from '../internal-types/organize.type';
import { CustomElement, ImageElement } from '@/commons/components/rich-text-editor/custom-types';

export interface UseCloudinaryUploadReturn {
  isUploading: boolean;
  uploadImagesToCloudinary: (data: OccaFormData) => Promise<OccaFormData>;
}

export const useCloudinaryUpload = (): UseCloudinaryUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Upload images to Cloudinary and return the processed data
   */
  const uploadImagesToCloudinary = async (data: OccaFormData): Promise<OccaFormData> => {
    setIsUploading(true);
    try {
      const processedData = { ...data };
      
      // Upload banner if provided
      if (processedData.basicInfo.bannerFile) {
        try {
          console.log("Uploading banner image to Cloudinary...");
          const bannerResponse = await uploadImageToCloudinary(
            processedData.basicInfo.bannerFile,
            "occa_banners"
          );
          
          // Replace blob URL with Cloudinary URL
          if (processedData.basicInfo.bannerUrl && processedData.basicInfo.bannerUrl.startsWith('blob:')) {
            URL.revokeObjectURL(processedData.basicInfo.bannerUrl);
          }
          processedData.basicInfo.bannerUrl = bannerResponse.secure_url;
          console.log("Banner uploaded successfully:", processedData.basicInfo.bannerUrl);
        } catch (err) {
          console.error("Failed to upload banner:", err);
          throw new Error("Không thể tải lên ảnh banner. Vui lòng thử lại.");
        }
      }
      
      // Process description to find blob images and upload them to Cloudinary
      if (processedData.basicInfo.description) {
        try {
          // Parse the description JSON
          let descriptionContent = JSON.parse(processedData.basicInfo.description) as (CustomElement)[];
          
          if (Array.isArray(descriptionContent)) {
            // Track if any images were uploaded and need updating
            let hasChanges = false;
            
            // Function to recursively process nodes and upload images
            const processNode = async (node: CustomElement): Promise<CustomElement> => {
              // Check if this is an image node with a blob URL
              if (node.type === 'image' && ('url' in node) && node.url?.startsWith('blob:')) {
                // Convert blob URL to File object
                try {
                  const response = await fetch(node.url);
                  const blob = await response.blob();
                  const imageNode = node as ImageElement;
                  const filename = imageNode.alt || 'image.jpg';
                  const file = new File([blob], filename, { type: blob.type });
                  
                  // Upload to Cloudinary
                  console.log(`Uploading description image to Cloudinary: ${filename}`);
                  const imageResponse = await uploadImageToCloudinary(file, "occa_descriptions");
                  
                  // Replace blob URL with Cloudinary URL
                  URL.revokeObjectURL(node.url);
                  hasChanges = true;
                  
                  // Return updated node while maintaining the correct structure
                  return {
                    ...imageNode,
                    url: imageResponse.secure_url,
                    children: [{ text: '' }]  // Image nodes always have this structure
                  };
                } catch (error) {
                  console.error("Failed to upload image from description:", error);
                  return node; // Keep original node on error
                }
              }
              
              // If node has children, process each child
              if ('children' in node && Array.isArray(node.children)) {
                const updatedChildren = await Promise.all(
                  node.children.map(async (child) => {
                    // Type guard to ensure child is a CustomElement
                    if (typeof child === 'object' && child !== null && 'type' in child && typeof child.type === 'string') {
                      // First cast to unknown to avoid direct casting error
                      return await processNode(child as unknown as CustomElement);
                    }
                    // If it's not a CustomElement, it must be a CustomText node
                    return child;
                  })
                );
                
                // Return node with processed children
                return {
                  ...node,
                  children: updatedChildren
                } as CustomElement;
              }
              
              // Return unchanged node
              return node;
            };
            
            // Process all root nodes
            descriptionContent = await Promise.all(
              descriptionContent.map(async (node) => processNode(node))
            );
            
            // Update the description if any changes were made
            if (hasChanges) {
              processedData.basicInfo.description = JSON.stringify(descriptionContent);
              console.log("Description images uploaded successfully");
            }
          }
        } catch (err) {
          console.error("Failed to process description images:", err);
          // Don't throw error here, continue with other uploads
        }
      }
      
      // Upload gallery images if provided
      if (processedData.gallery && processedData.gallery.length > 0) {
        const galleryWithFiles = processedData.gallery.filter(item => item.file);
        
        if (galleryWithFiles.length > 0) {
          try {
            console.log(`Uploading ${galleryWithFiles.length} gallery images to Cloudinary...`);
            const uploadPromises = galleryWithFiles.map(async (item) => {
              if (!item.file) return item;
              
              const response = await uploadImageToCloudinary(
                item.file,
                "occa_galleries"
              );
              
              // Release the blob URL if it exists
              if (item.image && item.image.startsWith('blob:')) {
                URL.revokeObjectURL(item.image);
              }
              
              return {
                ...item,
                image: response.secure_url
              };
            });
            
            // Replace old gallery with new gallery with Cloudinary URLs
            const updatedGallery = await Promise.all(uploadPromises);
            processedData.gallery = updatedGallery;
            console.log("Gallery images uploaded successfully");
          } catch (err) {
            console.error("Failed to upload gallery images:", err);
            throw new Error("Không thể tải lên một số ảnh thư viện. Vui lòng thử lại.");
          }
        }
      }
      
      return processedData;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadImagesToCloudinary
  };
};