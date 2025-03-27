import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/commons/hooks/use-toast';
import { 
  OccaFormData, 
  BasicInfoFormData,
  ShowFormData,
  TicketFormData,
  GalleryItem
} from '../internal-types/organize.type';
import { generateTempShowId, generateTempTicketId } from '../utils/id-generator';

export interface UseOccaFormStateOptions {
  isEditing?: boolean;
  initialData?: OccaFormData;
}

export interface UseOccaFormStateReturn {
  occaData: OccaFormData;
  originalData: OccaFormData | null;
  activeTab: string;
  isFormValid: boolean;
  hasChanges: boolean;
  setActiveTab: (tab: string) => void;
  validateForm: () => boolean;
  updateBasicInfo: (data: BasicInfoFormData) => void;
  updateShows: (shows: ShowFormData[]) => void;
  updateTickets: (tickets: TicketFormData[]) => void;
  updateGallery: (gallery: GalleryItem[]) => void;
  createShow: (show: Omit<ShowFormData, 'id'>) => ShowFormData;
  createTicket: (ticket: Omit<TicketFormData, 'id'>) => TicketFormData;
  addShow: (show: Omit<ShowFormData, 'id'>) => ShowFormData;
  updateShow: (showId: string, show: Partial<ShowFormData>) => void;
  deleteShow: (showId: string) => void;
  addTicket: (ticket: Omit<TicketFormData, 'id'>) => TicketFormData | null;
  updateTicket: (ticketId: string, ticket: Partial<TicketFormData>) => void;
  deleteTicket: (ticketId: string) => void;
}

// Default empty form data
const defaultOccaData: OccaFormData = {
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
};

export const useOccaFormState = ({ 
  isEditing = false, 
  initialData 
}: UseOccaFormStateOptions): UseOccaFormStateReturn => {
  const [activeTab, setActiveTab] = useState("basic-info");
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Keep original data for comparison in edit mode
  const [originalData, setOriginalData] = useState<OccaFormData | null>(isEditing ? structuredClone(initialData || defaultOccaData) : null);
  const [occaData, setOccaData] = useState<OccaFormData>(initialData || defaultOccaData);
  
  // Initialize with initialData if provided (for edit mode)
  useEffect(() => {
    if (initialData) {
      setOccaData(initialData);
      if (isEditing) {
        setOriginalData(structuredClone(initialData));
      }
    }
  }, [initialData, isEditing]);

  // Track if there are changes between current data and original data
  const [hasChanges, setHasChanges] = useState(false);

  // Update hasChanges when occaData changes
  useEffect(() => {
    if (!isEditing || !originalData) {
      setHasChanges(true);
      return;
    }

    // Deep compare function for nested objects
    const hasDeepChanges = (original: any, current: any): boolean => {
      // Handle null/undefined cases
      if (original === current) return false;
      if (!original || !current) return true;

      // Different types
      if (typeof original !== typeof current) return true;

      // Arrays comparison
      if (Array.isArray(original) && Array.isArray(current)) {
        if (original.length !== current.length) return true;
        
        // For arrays, we need to be smarter about ID based comparisons
        if (original.length > 0 && 'id' in original[0]) {
          // Map objects by ID for easier comparison
          const originalMap = new Map(original.map(item => [item.id, item]));
          const currentMap = new Map(current.map(item => [item.id, item]));
          
          // Check for missing or added IDs
          if (originalMap.size !== currentMap.size) return true;
          
          // Check each item by ID
          for (const [id, originalItem] of originalMap) {
            const currentItem = currentMap.get(id);
            if (!currentItem || hasDeepChanges(originalItem, currentItem)) {
              return true;
            }
          }
          return false;
        }
        
        // Default array comparison when items don't have IDs
        return original.some((item, index) => hasDeepChanges(item, current[index]));
      }

      // Object comparison
      if (typeof original === 'object' && typeof current === 'object') {
        const originalKeys = Object.keys(original);
        const currentKeys = Object.keys(current);
        
        // Special handling for Files
        if (currentKeys.includes('bannerFile') && current.bannerFile instanceof File) {
          return true;
        }
        
        if (originalKeys.length !== currentKeys.length) return true;
        
        return originalKeys.some(key => {
          // Skip file objects in comparison
          if (key === 'bannerFile' || key === 'file') return false;
          return hasDeepChanges(original[key], current[key]);
        });
      }
      
      // Simple value comparison
      return original !== current;
    };
    
    // Compare current data with original data
    const changed = hasDeepChanges(originalData, occaData);
    setHasChanges(changed);
  }, [occaData, originalData, isEditing]);

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

  // Show management functions
  const createShow = useCallback((show: Omit<ShowFormData, 'id'>): ShowFormData => {
    return {
      ...show,
      id: generateTempShowId()
    };
  }, []);

  const addShow = useCallback((show: Omit<ShowFormData, 'id'>) => {
    const newShow = createShow(show);
    setOccaData(prev => ({
      ...prev,
      shows: [...prev.shows, newShow]
    }));
    return newShow;
  }, [createShow]);

  const updateShow = useCallback((showId: string, show: Partial<ShowFormData>) => {
    setOccaData(prev => ({
      ...prev,
      shows: prev.shows.map(s => s.id === showId ? { ...s, ...show } : s)
    }));
  }, []);

  const deleteShow = useCallback((showId: string) => {
    setOccaData(prev => ({
      ...prev,
      shows: prev.shows.filter(s => s.id !== showId),
      // Remove any tickets associated with this show
      tickets: prev.tickets.filter(t => t.showId !== showId)
    }));
  }, []);

  // Ticket management functions
  const createTicket = useCallback((ticket: Omit<TicketFormData, 'id'>): TicketFormData => {
    return {
      ...ticket,
      id: generateTempTicketId()
    };
  }, []);

  const addTicket = useCallback((ticket: Omit<TicketFormData, 'id'>) => {
    // Check if showId exists
    const showExists = occaData.shows.some(show => show.id === ticket.showId);
    if (!showExists) {
      console.error(`Cannot create ticket: Show ID doesn't exist: ${ticket.showId}`);
      toast({
        title: "Lỗi",
        description: "Không thể tạo vé: Suất diễn không tồn tại",
        variant: "destructive",
      });
      return null;
    }
    
    const newTicket = createTicket(ticket);
    setOccaData(prev => ({
      ...prev,
      tickets: [...prev.tickets, newTicket]
    }));
    return newTicket;
  }, [createTicket, occaData.shows]);

  const updateTicket = useCallback((ticketId: string, ticket: Partial<TicketFormData>) => {
    setOccaData(prev => ({
      ...prev,
      tickets: prev.tickets.map(t => t.id === ticketId ? { ...t, ...ticket } : t)
    }));
  }, []);

  const deleteTicket = useCallback((ticketId: string) => {
    setOccaData(prev => ({
      ...prev,
      tickets: prev.tickets.filter(t => t.id !== ticketId)
    }));
  }, []);

  return {
    occaData,
    originalData,
    activeTab,
    isFormValid,
    hasChanges,
    setActiveTab,
    validateForm,
    updateBasicInfo,
    updateShows,
    updateTickets,
    updateGallery,
    createShow,
    createTicket,
    addShow,
    updateShow,
    deleteShow,
    addTicket,
    updateTicket,
    deleteTicket
  };
};