import { Editor } from 'slate';
import { insertImage as insertImageElement } from './with-images';

/**
 * Handles the image file selection
 */
export const handleImageSelection = async (
  file: File,
  editor: Editor
): Promise<void> => {
  try {
    insertImageElement(editor, file);
  } catch (error) {
    console.error('Error processing image:', error);
  }
};

/**
 * Cleanup all blob URLs when component unmounts
 */
export const cleanupBlobUrls = (): void => {
  // Get all URLs from the DOM and revoke them
  const images = document.querySelectorAll('img[src^="blob:"]');
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('blob:')) {
      URL.revokeObjectURL(src);
    }
  });
};

// Không còn cần hàm storeImages và loadImages nữa
