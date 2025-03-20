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

  // Handle form submission for approval
  const handleSubmitForApproval = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create occa with pending status
      const payload: CreateOccaPayload = {
        ...occaData,
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
      // Prepare data for submission
      const processedData = { ...occaData };
      
      // Upload banner if provided
      if (processedData.basicInfo.bannerFile) {
        try {
          const bannerResponse = await uploadImageToCloudinary(
            processedData.basicInfo.bannerFile,
            "occa_banners"
          );
          processedData.basicInfo.bannerUrl = bannerResponse.secure_url;
        } catch (err) {
          console.error("Failed to upload banner:", err);
          toast({
            title: "Lỗi",
            description: "Không thể tải lên ảnh banner. Vui lòng thử lại.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      }
      
      // Upload gallery images if provided
      if (processedData.gallery && processedData.gallery.length > 0) {
        const galleryWithFiles = processedData.gallery.filter(item => item.file);
        
        if (galleryWithFiles.length > 0) {
          try {
            const uploadPromises = galleryWithFiles.map(async (item) => {
              if (!item.file) return item;
              
              const response = await uploadImageToCloudinary(
                item.file,
                "occa_galleries"
              );
              
              return {
                ...item,
                image: response.secure_url
              };
            });
            
            // Replace old gallery with new gallery with Cloudinary URLs
            const updatedGallery = await Promise.all(uploadPromises);
            processedData.gallery = updatedGallery;
          } catch (err) {
            console.error("Failed to upload gallery images:", err);
            toast({
              title: "Lỗi",
              description: "Không thể tải lên một số ảnh thư viện. Vui lòng thử lại.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
        }
      }
      
      // Remove unnecessary File fields before sending to API
      processedData.basicInfo = { ...processedData.basicInfo };
      delete processedData.basicInfo.bannerFile;
      
      processedData.gallery = processedData.gallery.map(item => ({
        id: item.id,
        image: item.image
      }));

      // Call API to create/update event
      const payload: CreateOccaPayload = {
        ...processedData,
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
