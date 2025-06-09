import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/commons/hooks/use-toast';
import { 
  OccaFormData, 
  CreateOccaPayload
} from '../internal-types/organize.type';
import { organizeService } from '../services/organize.service';
import { useCloudinaryUpload } from './useCloudinaryUpload';

export interface UseOccaSubmissionOptions {
  isEditing: boolean;
  occaId?: string;
}

export interface UseOccaSubmissionReturn {
  isSaving: boolean;
  isDraft: boolean;
  isSubmitting: boolean;
  handleSave: (data: OccaFormData, originalData: OccaFormData | null, asDraft: boolean, validateFormFn: () => boolean, requiresApprovalReset?: boolean) => Promise<void>;
  handleSubmitForApproval: (data: OccaFormData, originalData: OccaFormData | null, validateFormFn: () => boolean, requiresApprovalReset?: boolean) => Promise<void>;
  preparePayloadForSubmission: (data: OccaFormData, originalData: OccaFormData | null) => OccaFormData;
}

export const useOccaSubmission = ({
  isEditing,
  occaId
}: UseOccaSubmissionOptions): UseOccaSubmissionReturn => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadImagesToCloudinary } = useCloudinaryUpload();

  /**
   * Prepare data for API submission by:
   * 1. Removing file objects
   * 2. Cleaning IDs
   * 3. In edit mode, creating a delta of changes
   */
  const preparePayloadForSubmission = (data: OccaFormData, originalData: OccaFormData | null): OccaFormData => {
    // Create a deep copy to avoid mutation
    const cleanData = JSON.parse(JSON.stringify(data)) as OccaFormData;
    
    // Remove File objects from basicInfo
    cleanData.basicInfo = { ...cleanData.basicInfo };
    delete cleanData.basicInfo.bannerFile;
    
    // Remove File objects from gallery items and only keep necessary fields
    if (cleanData.gallery) {
      cleanData.gallery = cleanData.gallery.map(item => ({
        id: isEditing ? item.id : undefined, // Only keep ID if editing
        image: item.image
      }));
    }

    // Create unique timestamp to ensure all temporary IDs from this session are related
    const timestamp = Date.now();
    const uniqueSessionId = Math.random().toString(36).substring(2, 8);

    // Create a map of old show IDs to new show IDs for updating ticket references
    // Moved this outside the shows block so it's accessible in the tickets block
    const showIdMap = new Map<string, string>();

    // STEP 1: Process shows first to ensure we have valid show IDs
    if (cleanData.shows) {
      cleanData.shows = cleanData.shows.map((show, index) => {
        const oldId = show.id;
        
        // Generate new ID with consistent format if needed
        let newId: string;
        if (isEditing && show.id && !show.id.startsWith('temp-')) {
          // Keep existing ID for editing mode
          newId = show.id;
        } else {
          // Create temporary ID with proper prefix
          newId = `temp-show-${timestamp}-${uniqueSessionId}-${index}`;
        }
        
        // Store the ID mapping if oldId exists
        if (oldId) {
          showIdMap.set(oldId, newId);
        }

        return {
          ...show,
          id: newId, // Ensure show always has an ID
          date: show.date,
          time: show.time,
          saleStatus: show.saleStatus
        };
      });
    }
    
    // STEP 2: Process tickets and update their showId references
    if (cleanData.tickets && cleanData.tickets.length > 0) {
      // Check each ticket and correct showId if necessary
      cleanData.tickets = cleanData.tickets.map((ticket, index) => {
        // Get new showId if this ticket references a show whose ID has changed
        const updatedShowId = showIdMap.get(ticket.showId);
        
        // Only update the showId if there's a mapping for it
        if (updatedShowId) {
          ticket.showId = updatedShowId;
        }
        
        // Check if this ticket's showId references a show that exists
        const showExists = cleanData.shows.some(s => s.id === ticket.showId);
        
        // If no matching show is found, assign to the first show (if available)
        if (!showExists && cleanData.shows.length > 0) {
          console.warn(`Fixing ticket with invalid showId: ${ticket.type}`);
          // Make sure we assign a string, not undefined
          const firstShowId = cleanData.shows[0].id as string;
          ticket.showId = firstShowId;
        }
        
        // Generate ticket ID with proper prefix if needed
        let newTicketId: string;
        if (isEditing && ticket.id && !ticket.id.startsWith('temp-')) {
          // Keep existing ID for editing mode
          newTicketId = ticket.id;
        } else {
          // Create temporary ID with proper prefix
          newTicketId = `temp-ticket-${timestamp}-${uniqueSessionId}-${index}`;
        }

        return {
          ...ticket,
          id: newTicketId,
          showId: ticket.showId,
          type: ticket.type,
          price: ticket.price,
          availableQuantity: ticket.availableQuantity
        };
      });
      
      // Final validation: Clean up any tickets that still don't have a valid showId
      cleanData.tickets = cleanData.tickets.filter(ticket => {
        const hasValidShow = cleanData.shows.some(show => show.id === ticket.showId);
        if (!hasValidShow) {
          console.warn(`Removing ticket with invalid showId ${ticket.showId} for ticket type: ${ticket.type}`);
        }
        return hasValidShow;
      });
    }
    
    // STEP 3: For edit mode, create a delta of changes if we have original data
    if (isEditing && originalData) {
      // We'll build a partial object with only the changes
      const changedData: Partial<OccaFormData> = {};

      // Helper function to check deep equality with complete type safety
      function isEqual<T>(a: T, b: T): boolean {
        // Handle direct equality and primitives
        if (Object.is(a, b)) return true;
        
        // Handle null/undefined
        if (a == null || b == null) return false;
        
        // Handle dates
        if (a instanceof Date && b instanceof Date) {
          return a.getTime() === b.getTime();
        }
        
        // Handle non-objects (after Date check)
        if (typeof a !== 'object' || typeof b !== 'object') return false;
        
        // Handle arrays
        if (Array.isArray(a) && Array.isArray(b)) {
          if (a.length !== b.length) return false;
          return a.every((val, idx) => isEqual(val, b[idx]));
        }
        
        // Ensure same constructors for objects
        if (a.constructor !== b.constructor) return false;
        
        // Handle objects
        const keysA = Object.keys(a as object) as (keyof T)[];
        const keysB = new Set(Object.keys(b as object));
        
        if (keysA.length !== keysB.size) return false;
        
        return keysA.every(key => {
          // Skip file properties
          if (key === 'file' || key === 'bannerFile') return true;
          
          // Ensure key exists in b
          if (!keysB.has(key as string)) return false;
          
          // Compare values
          return isEqual(
            a[key], 
            (b as T)[key]
          );
        });
      }
      
      // Check for changes in basic info
      if (!isEqual(cleanData.basicInfo, originalData.basicInfo)) {
        changedData.basicInfo = cleanData.basicInfo;
      }
      
      // Always include shows and tickets because of references
      changedData.shows = cleanData.shows;
      changedData.tickets = cleanData.tickets;
      
      // Check for changes in gallery
      if (!isEqual(cleanData.gallery, originalData.gallery)) {
        changedData.gallery = cleanData.gallery;
      }
      
      // If we have at least one change, we'll use the partial object
      // Otherwise, we'll use the full object
      if (Object.keys(changedData).length > 0) {
        // We need to at least return the full IDs
        // This approach means we only send changed sections
        // but each section must be complete (not just changed fields within a section)
        return { ...changedData } as OccaFormData;
      }
    }
    
    // For new creation or when no changes identified, return full cleaned object
    return cleanData;
  };
  /**
   * Handle form submission for approval
   */
  const handleSubmitForApproval = async (data: OccaFormData, originalData: OccaFormData | null, validateFormFn: () => boolean, requiresApprovalReset: boolean = true) => {
    if (!validateFormFn()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // First, upload all images to Cloudinary
      let processedData = { ...data };
      
      try {
        processedData = await uploadImagesToCloudinary(processedData);
      } catch (error) {
        toast({
          title: "Lỗi tải lên ảnh",
          description: error instanceof Error ? error.message : "Không thể tải lên ảnh. Vui lòng thử lại.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for API submission
      const cleanData = preparePayloadForSubmission(processedData, originalData);      // Determine approval status based on whether approval reset is required
      const currentApprovalStatus = originalData?.approvalStatus;
      const approvalStatus: "pending" | "draft" = requiresApprovalReset ? "pending" : (currentApprovalStatus as "pending" | "draft") || "pending";
      
      // Create payload with approval status
      const payload: CreateOccaPayload = {
        ...cleanData,
        status: "active",
        approvalStatus
      };

      // Log the payload for debugging
      console.log("Submitting payload for approval:", JSON.stringify(payload, null, 2));
      console.log("requiresApprovalReset:", requiresApprovalReset);
      console.log("Final approvalStatus:", approvalStatus);

      if (isEditing && occaId) {
        await organizeService.updateOcca(occaId, payload);
        toast({
          title: "Thành công",
          description: requiresApprovalReset 
            ? "Sự kiện đã được cập nhật và gửi để xét duyệt" 
            : "Sự kiện đã được cập nhật thành công",
        });
      } else {
        await organizeService.createOcca(payload);
        toast({
          title: "Thành công",
          description: "Sự kiện đã được gửi để xét duyệt",
        });
      }

      navigate("/organize");
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể gửi sự kiện. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  /**
   * Handle saving (draft or published)
   */
  const handleSave = async (data: OccaFormData, originalData: OccaFormData | null, asDraft: boolean, validateFormFn: () => boolean, requiresApprovalReset: boolean = true) => {
    // Only validate if not saving as draft
    if (!asDraft && !validateFormFn()) {
      return;
    }

    setIsSaving(true);
    setIsDraft(asDraft);

    try {
      // First, upload all images to Cloudinary
      let processedData = { ...data };
      
      try {
        processedData = await uploadImagesToCloudinary(processedData);
      } catch (error) {
        toast({
          title: "Lỗi tải lên ảnh",
          description: error instanceof Error ? error.message : "Không thể tải lên ảnh. Vui lòng thử lại.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      // Prepare data for API submission
      const cleanData = preparePayloadForSubmission(processedData, originalData);
      
      // Determine approval status for save operation
      let approvalStatus: "draft" | "pending" | "approved" | "rejected" = "draft";
        if (!asDraft && isEditing) {
        // For published saves in edit mode, only reset to pending if basic info or gallery changed
        const currentApprovalStatus = originalData?.approvalStatus;
        approvalStatus = requiresApprovalReset ? "pending" : (currentApprovalStatus as "draft" | "pending" | "approved" | "rejected") || "draft";
      }
      
      // Create payload with draft status
      const payload: CreateOccaPayload = {
        ...cleanData,
        status: asDraft ? "draft" : "active",
        approvalStatus
      };

      // Log the payload for debugging
      console.log("Saving payload:", JSON.stringify(payload, null, 2));
      console.log("requiresApprovalReset:", requiresApprovalReset);
      console.log("Final approvalStatus for save:", approvalStatus);

      if (isEditing && occaId) {
        await organizeService.updateOcca(occaId, payload);
        toast({
          title: "Thành công",
          description: asDraft ? "Đã cập nhật bản nháp sự kiện" : "Đã cập nhật sự kiện",
        });
      } else {
        await organizeService.createOcca(payload);
        toast({
          title: "Thành công",
          description: "Đã lưu bản nháp sự kiện",
        });
      }
      
      navigate("/organize");
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể lưu sự kiện. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    isDraft,
    isSubmitting,
    handleSave,
    handleSubmitForApproval,
    preparePayloadForSubmission
  };
};