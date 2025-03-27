import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/commons/hooks/use-toast';
import { uploadImageToCloudinary } from '@/utils/cloudinary.utils';
import { organizeService } from '../services/organize.service';
import { 
  OccaFormData, 
  CreateOccaPayload, 
  BasicInfoFormData,
  ShowFormData,
  TicketFormData,
  GalleryItem
} from '../internal-types/organize.type';
import { CustomElement, ImageElement } from '@/commons/components/rich-text-editor/custom-types';

export interface UseOccaFormOptions {
  isEditing?: boolean;
  occaId?: string;
  initialData?: OccaFormData;
}

export interface UseOccaFormReturn {
  occaData: OccaFormData;
  activeTab: string;
  isSaving: boolean;
  isDraft: boolean;
  isSubmitting: boolean;
  isFormValid: boolean;
  setActiveTab: (tab: string) => void;
  validateForm: () => boolean;
  handleSave: (asDraft: boolean) => Promise<void>;
  handleSubmitForApproval: () => Promise<void>;
  updateBasicInfo: (data: BasicInfoFormData) => void;
  updateShows: (shows: ShowFormData[]) => void;
  updateTickets: (tickets: TicketFormData[]) => void;
  updateGallery: (gallery: GalleryItem[]) => void;
}

export const useOccaForm = ({ 
  isEditing = false, 
  occaId,
  initialData 
}: UseOccaFormOptions): UseOccaFormReturn => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [isSaving, setIsSaving] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [occaData, setOccaData] = useState<OccaFormData>(initialData || {
    basicInfo: {
      title: "",
      artist: "",
      location: "",
      address: "",
      duration: 120,
      description: "",
      bannerUrl: "",
    },
    shows: [],
    tickets: [],
    gallery: []
  });

  // Initialize with initialData if provided (for edit mode)
  useEffect(() => {
    if (initialData) {
      setOccaData(initialData);
    }
  }, [initialData]);

  // Validate form data
  const validateForm = useCallback((): boolean => {
    if (!occaData.basicInfo?.title) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên sự kiện",
        variant: "destructive",
      });
      setActiveTab("basic-info");
      return false;
    }

    if (!occaData.basicInfo?.location) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập địa điểm",
        variant: "destructive",
      });
      setActiveTab("basic-info");
      return false;
    }

    if (!occaData.shows || occaData.shows.length === 0) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng thêm ít nhất một suất diễn",
        variant: "destructive",
      });
      setActiveTab("shows");
      return false;
    }

    if (!occaData.tickets || occaData.tickets.length === 0) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng thêm ít nhất một loại vé",
        variant: "destructive",
      });
      setActiveTab("tickets");
      return false;
    }

    return true;
  }, [occaData.basicInfo?.title, occaData.basicInfo?.location, occaData.shows, occaData.tickets]);

  // Update form validity
  useEffect(() => {
    const isValid = Boolean(
      occaData.basicInfo?.title &&
      occaData.basicInfo?.location &&
      occaData.shows?.length > 0 &&
      occaData.tickets?.length > 0
    );
    setIsFormValid(isValid);
  }, [occaData]);

  // Upload images to Cloudinary and return the processed data
  const uploadImagesToCloudinary = async (data: OccaFormData): Promise<OccaFormData> => {
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
  };

  // Cleanup function to remove file objects and prepare payload for API
  const preparePayloadForSubmission = (data: OccaFormData): OccaFormData => {
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
    
    // Remove IDs from shows if not editing
    if (!isEditing && cleanData.shows) {
      cleanData.shows = cleanData.shows.map(show => ({
        ...show,
        id: undefined // Remove ID for new creation
      }));
    }
    
    // Remove IDs from tickets if not editing
    if (!isEditing && cleanData.tickets) {
      cleanData.tickets = cleanData.tickets.map(ticket => ({
        ...ticket,
        id: undefined // Remove ID for new creation
      }));
    }
    
    return cleanData;
  };

  // Handle form submission for approval
  const handleSubmitForApproval = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // First, upload all images to Cloudinary
      let processedData = { ...occaData };
      
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
      const cleanData = preparePayloadForSubmission(processedData);
      
      // Create payload with approval status
      const payload: CreateOccaPayload = {
        ...cleanData,
        status: "active",
        approvalStatus: "pending"
      };

      // Log the payload for debugging
      console.log("Submitting payload for approval:", JSON.stringify(payload, null, 2));

      if (isEditing && occaId) {
        await organizeService.updateOcca(occaId, payload);
        toast({
          title: "Thành công",
          description: "Sự kiện đã được cập nhật và gửi để xét duyệt",
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

  // Handle saving (draft or published)
  const handleSave = async (asDraft: boolean) => {
    // Only validate if not saving as draft
    if (!asDraft && !validateForm()) {
      return;
    }

    setIsSaving(true);
    setIsDraft(asDraft);

    try {
      // First, upload all images to Cloudinary
      let processedData = { ...occaData };
      
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
      const cleanData = preparePayloadForSubmission(processedData);
      
      // Create payload with draft status
      const payload: CreateOccaPayload = {
        ...cleanData,
        status: asDraft ? "draft" : "active",
        approvalStatus: "draft" // Always draft when saving
      };

      // Log the payload for debugging
      console.log("Saving payload:", JSON.stringify(payload, null, 2));

      if (isEditing && occaId) {
        await organizeService.updateOcca(occaId, payload);
        toast({
          title: "Thành công",
          description: "Đã cập nhật bản nháp sự kiện",
        });
      } else {
        await organizeService.createOcca(payload);
        toast({
          title: "Thành công",
          description: "Đã lưu bản nháp sự kiện",
        });
      }

      // Update the local state with the processed data
      setOccaData(processedData);
      
      navigate("/organize");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu sự kiện. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update individual form sections
  const updateBasicInfo = useCallback((data: BasicInfoFormData) => {
    setOccaData(prev => ({ ...prev, basicInfo: data }));
  }, []);

  const updateShows = useCallback((shows: ShowFormData[]) => {
    setOccaData(prev => ({ ...prev, shows }));
  }, []);

  const updateTickets = useCallback((tickets: TicketFormData[]) => {
    setOccaData(prev => ({ ...prev, tickets }));
  }, []);

  const updateGallery = useCallback((gallery: GalleryItem[]) => {
    setOccaData(prev => ({ ...prev, gallery }));
  }, []);

  return {
    occaData,
    activeTab,
    isSaving,
    isDraft,
    isSubmitting,
    isFormValid,
    setActiveTab,
    validateForm,
    handleSave,
    handleSubmitForApproval,
    updateBasicInfo,
    updateShows,
    updateTickets,
    updateGallery
  };
};
