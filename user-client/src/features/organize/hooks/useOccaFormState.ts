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
    organizer: "",
    description: "",
    bannerUrl: "",
    categoryId: "",
    regionId: "",
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
    }    // Deep compare function for nested objects
    function hasDeepChanges<T>(original: T, current: T, path: string = 'root'): { changed: boolean; changedPaths: string[] } {     
      const changedPaths: string[] = [];
      
      // Debug logging at the start
      if (path === 'root') {
        console.log('=== Starting deep comparison ===');
        console.log('Original data:', original);
        console.log('Current data:', current);
      }
      
      // Handle direct equality
      if (Object.is(original, current)) return { changed: false, changedPaths };
      
      // Handle null/undefined cases
      if (original == null || current == null) {
        console.log(`Change detected at ${path}: ${original} !== ${current}`);
        changedPaths.push(path);
        return { changed: true, changedPaths };
      }
      
      // Handle dates
      if (original instanceof Date && current instanceof Date) {
        const dateChanged = original.getTime() !== current.getTime();
        if (dateChanged) {
          console.log(`Date change detected at ${path}: ${original} !== ${current}`);
          changedPaths.push(path);
        }
        return { changed: dateChanged, changedPaths };
      }
      
      // Handle non-objects (after Date check)
      if (typeof original !== 'object' || typeof current !== 'object') {
        const primitiveChanged = original !== current;
        if (primitiveChanged) {
          console.log(`Primitive change detected at ${path}: ${original} !== ${current}`);
          changedPaths.push(path);
        }
        return { changed: primitiveChanged, changedPaths };
      }
      
      // Handle arrays with proper type checking
      if (Array.isArray(original) && Array.isArray(current)) {
        if (original.length !== current.length) {
          console.log(`Array length change detected at ${path}: ${original.length} !== ${current.length}`);
          changedPaths.push(`${path}.length`);
          return { changed: true, changedPaths };
        }
        
        // Special handling for arrays of objects with IDs
        if (original.length > 0 && typeof original[0] === 'object' && original[0] !== null && 'id' in original[0]) {
          const originalMap = new Map(
            original.map(item => [(item as { id: string }).id, item])
          );
          const currentMap = new Map(
            current.map(item => [(item as { id: string }).id, item])
          );
          
          if (originalMap.size !== currentMap.size) {
            console.log(`Array map size change detected at ${path}: ${originalMap.size} !== ${currentMap.size}`);
            changedPaths.push(`${path}.size`);
            return { changed: true, changedPaths };
          }
          
          for (const [id, originalItem] of originalMap) {
            const currentItem = currentMap.get(id);
            if (!currentItem) {
              console.log(`Item with id ${id} missing in current at ${path}`);
              changedPaths.push(`${path}.${id}`);
              return { changed: true, changedPaths };
            }
            
            const itemResult = hasDeepChanges(originalItem, currentItem, `${path}.${id}`);
            if (itemResult.changed) {
              changedPaths.push(...itemResult.changedPaths);
              return { changed: true, changedPaths };
            }
          }
          
          return { changed: false, changedPaths };
        }
        
        // Regular array comparison
        for (let i = 0; i < original.length; i++) {
          const itemResult = hasDeepChanges(original[i], current[i], `${path}[${i}]`);
          if (itemResult.changed) {
            changedPaths.push(...itemResult.changedPaths);
            return { changed: true, changedPaths };
          }
        }
          return { changed: false, changedPaths };
      }      // Handle objects
      const originalObj = original as Record<string, unknown>;
      const currentObj = current as Record<string, unknown>;
      
      const originalKeys = Object.keys(originalObj);
      const currentKeys = Object.keys(currentObj);
      
      // Debug logging for file detection - only log for basicInfo to reduce noise
      if (path.includes('basicInfo')) {
        console.log(`Checking file changes at ${path}:`);
        console.log(`- Original keys:`, originalKeys);
        console.log(`- Current keys:`, currentKeys);
        console.log(`- Original bannerFile:`, originalObj.bannerFile);
        console.log(`- Current bannerFile:`, currentObj.bannerFile);
        console.log(`- Original bannerUrl:`, originalObj.bannerUrl);
        console.log(`- Current bannerUrl:`, currentObj.bannerUrl);
      }      
      // Special handling for Files - detect any file-related changes
      const hasNewFile = currentKeys.includes('bannerFile') && currentObj.bannerFile instanceof File;
      const hadFile = originalKeys.includes('bannerFile') && originalObj.bannerFile instanceof File;
      const bannerFileChanged = originalObj.bannerFile !== currentObj.bannerFile;
      
      if (path.includes('basicInfo')) {
        console.log(`File check: hasNewFile=${hasNewFile}, hadFile=${hadFile}, bannerFileChanged=${bannerFileChanged}`);
      }
        if (hasNewFile || hadFile || bannerFileChanged) {
        console.log(`✅ File change detected at ${path}: hasNewFile=${hasNewFile}, hadFile=${hadFile}, bannerFileChanged=${bannerFileChanged}`);
        changedPaths.push(`${path}.bannerFile`);
        return { changed: true, changedPaths };
      }

      // Special handling for banner URL changes (for delete banner case)
      if (originalKeys.includes('bannerUrl') && currentKeys.includes('bannerUrl')) {
        const originalBannerUrl = originalObj.bannerUrl as string;
        const currentBannerUrl = currentObj.bannerUrl as string;
        
        if (path.includes('basicInfo')) {
          console.log(`Banner URL check: "${originalBannerUrl}" vs "${currentBannerUrl}"`);
        }
        
        // Detect banner URL changes (including empty string changes)
        if (originalBannerUrl !== currentBannerUrl) {
          console.log(`✅ Banner URL change detected at ${path}: "${originalBannerUrl}" !== "${currentBannerUrl}"`);
          changedPaths.push(`${path}.bannerUrl`);
          return { changed: true, changedPaths };
        }
      }

      // Check if bannerFile was removed (from File to undefined)
      if (originalKeys.includes('bannerFile') && !currentKeys.includes('bannerFile')) {
        console.log(`✅ Banner file removed at ${path}`);
        changedPaths.push(`${path}.bannerFile`);
        return { changed: true, changedPaths };
      }

      // Check if bannerFile was added (from undefined to File)
      if (!originalKeys.includes('bannerFile') && currentKeys.includes('bannerFile')) {
        console.log(`✅ Banner file added at ${path}`);
        changedPaths.push(`${path}.bannerFile`);
        return { changed: true, changedPaths };
      }

      // Filter out file-related keys for comparison to avoid false positives
      // Note: We keep bannerUrl in comparison since we handle it specially above
      const filteredOriginalKeys = originalKeys.filter(key => !['bannerFile', 'file'].includes(key));
      const filteredCurrentKeys = currentKeys.filter(key => !['bannerFile', 'file'].includes(key));

      // Sort keys to avoid order-based false positives
      filteredOriginalKeys.sort();
      filteredCurrentKeys.sort();

      if (filteredOriginalKeys.length !== filteredCurrentKeys.length) {
        console.log(`Object keys length change detected at ${path}: ${filteredOriginalKeys.length} !== ${filteredCurrentKeys.length}`);
        console.log(`Original keys: ${filteredOriginalKeys.join(', ')}`);
        console.log(`Current keys: ${filteredCurrentKeys.join(', ')}`);
        changedPaths.push(`${path}.keys`);
        return { changed: true, changedPaths };
      }

      // Check if key names are different (after filtering and sorting)
      const keysDifferent = filteredOriginalKeys.some((key, index) => key !== filteredCurrentKeys[index]);
      if (keysDifferent) {
        console.log(`Object keys difference detected at ${path}`);
        console.log(`Original keys: ${filteredOriginalKeys.join(', ')}`);
        console.log(`Current keys: ${filteredCurrentKeys.join(', ')}`);
        changedPaths.push(`${path}.keys`);
        return { changed: true, changedPaths };
      }        for (const key of filteredOriginalKeys) {
        // Skip duration field, bannerFile (already handled above), and bannerUrl (handled specially above)
        if (key === 'duration' || key === 'bannerFile' || key === 'bannerUrl') continue;
        
        const keyResult = hasDeepChanges(originalObj[key], currentObj[key], `${path}.${key}`);
        if (keyResult.changed) {
          changedPaths.push(...keyResult.changedPaths);
          return { changed: true, changedPaths };
        }
      }
      
      return { changed: false, changedPaths };
    }
      // Compare current data with original data
    const result = hasDeepChanges(originalData, occaData);
    setHasChanges(result.changed);
    
    console.log(`🔄 hasChanges updated to: ${result.changed}`);
    
    if (result.changed) {
      console.log("✅ Changes detected in the following paths:", result.changedPaths);
    } else {
      console.log("❌ No changes detected");
    }
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