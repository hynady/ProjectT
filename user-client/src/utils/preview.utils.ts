/**
 * Utilities for storing and retrieving preview data
 */
import { PreviewData } from "@/features/organize/internal-types/preview.type";

const PREVIEW_STORAGE_KEY = 'occa_preview_data';

/**
 * Save preview data to localStorage
 * 
 * @param data The occa data to preview
 * @throws Error if localStorage is not available or data cannot be serialized
 */
export function savePreviewData(data: PreviewData): void {
  if (!data) {
    console.error("No data provided for preview");
    throw new Error("No data provided for preview");
  }

  try {
    // Log the data being saved
    console.log("Saving preview data:", JSON.stringify(data).substring(0, 100) + "...");
    
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      console.error("localStorage is not available");
      throw new Error("localStorage is not available");
    }
    
    // Simple test to see if localStorage works
    try {
      localStorage.setItem('test_storage', 'test');
      localStorage.removeItem('test_storage');
    } catch (e) {
      console.error("localStorage test failed:", e);
      throw new Error("localStorage is not writable");
    }
    
    // Serialize data with more precise error handling
    let serializedData: string;
    try {
      serializedData = JSON.stringify(data);
    } catch (e) {
      console.error("Failed to serialize preview data:", e);
      throw new Error("Failed to serialize preview data: " + (e instanceof Error ? e.message : String(e)));
    }
    
    if (!serializedData) {
      console.error("Serialized data is empty");
      throw new Error("Failed to serialize preview data");
    }
    
    // Save to localStorage
    try {
      localStorage.setItem(PREVIEW_STORAGE_KEY, serializedData);
    } catch (e) {
      console.error("Failed to write to localStorage:", e);
      throw new Error("Failed to write to localStorage: " + (e instanceof Error ? e.message : String(e)));
    }
    
    // Verify data was saved correctly
    const savedData = localStorage.getItem(PREVIEW_STORAGE_KEY);
    if (!savedData) {
      console.error("Verification failed - data not saved to localStorage");
      throw new Error("Failed to save preview data to localStorage");
    }
    
    console.log("Preview data successfully saved to localStorage");
  } catch (error) {
    console.error('Failed to save preview data to localStorage:', error);
    throw error; // Re-throw to allow caller to handle it
  }
}

/**
 * Retrieve preview data from localStorage
 * 
 * @returns The saved preview data or null if not found
 */
export function getPreviewData(): PreviewData | null {
  try {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      console.error("localStorage is not available");
      return null;
    }
    
    const data = localStorage.getItem(PREVIEW_STORAGE_KEY);
    if (!data) {
      console.log("No preview data found in localStorage");
      return null;
    }
    
    const parsedData = JSON.parse(data) as PreviewData;
    console.log("Preview data successfully retrieved from localStorage");
    return parsedData;
  } catch (error) {
    console.error('Failed to retrieve preview data from localStorage:', error);
    return null;
  }
}

/**
 * Clear preview data from localStorage
 */
export function clearPreviewData(): void {
  try {
    localStorage.removeItem(PREVIEW_STORAGE_KEY);
    console.log("Preview data cleared from localStorage");
  } catch (error) {
    console.error('Failed to clear preview data from localStorage:', error);
  }
}

/**
 * Check if preview data exists in localStorage
 * 
 * @returns true if preview data exists, false otherwise
 */
export function hasPreviewData(): boolean {
  try {
    return localStorage.getItem(PREVIEW_STORAGE_KEY) !== null;
  } catch (error) {
    console.error('Failed to check if preview data exists:', error);
    return false;
  }
}
