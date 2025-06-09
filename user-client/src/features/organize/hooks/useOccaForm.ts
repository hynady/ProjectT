import { useOccaFormState } from './useOccaFormState';
import { useOccaSubmission } from './useOccaSubmission';
import { 
  OccaFormData, 
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
  hasChanges: boolean; // NEW: Track changes for edit mode
  hasBasicInfoChanges: boolean;
  hasGalleryChanges: boolean;
  requiresApprovalReset: boolean; // true if basicInfo or gallery changed
  setActiveTab: (tab: string) => void;
  validateForm: () => boolean;
  handleSave: (asDraft: boolean) => Promise<void>;
  handleSubmitForApproval: () => Promise<void>;
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

export const useOccaForm = ({ 
  isEditing = false, 
  occaId,
  initialData 
}: UseOccaFormOptions): UseOccaFormReturn => {
  // Use our sub-hooks to manage state and submission logic
  const formState = useOccaFormState({ isEditing, initialData });
  const submission = useOccaSubmission({ isEditing, occaId });
    // Handle form submission for approval
  const handleSubmitForApproval = async () => {
    if (isEditing && !formState.hasChanges) {
      // In edit mode, only allow submission when there are changes
      return;
    }
    
    return submission.handleSubmitForApproval(
      formState.occaData,
      formState.originalData,
      formState.validateForm,
      formState.requiresApprovalReset
    );
  };

  // Handle saving (draft or published)
  const handleSave = async (asDraft: boolean) => {
    if (isEditing && !formState.hasChanges) {
      // In edit mode, only allow saving when there are changes
      return;
    }
    
    return submission.handleSave(
      formState.occaData,
      formState.originalData,
      asDraft,
      formState.validateForm,
      formState.requiresApprovalReset
    );
  };
  return {
    occaData: formState.occaData,
    activeTab: formState.activeTab,
    isSaving: submission.isSaving,
    isDraft: submission.isDraft,
    isSubmitting: submission.isSubmitting,
    isFormValid: formState.isFormValid,
    hasChanges: formState.hasChanges,
    hasBasicInfoChanges: formState.hasBasicInfoChanges,
    hasGalleryChanges: formState.hasGalleryChanges,
    requiresApprovalReset: formState.requiresApprovalReset,
    setActiveTab: formState.setActiveTab,
    validateForm: formState.validateForm,
    handleSave,
    handleSubmitForApproval,
    updateBasicInfo: formState.updateBasicInfo,
    updateShows: formState.updateShows,
    updateTickets: formState.updateTickets,
    updateGallery: formState.updateGallery,
    createShow: formState.createShow,
    createTicket: formState.createTicket,
    addShow: formState.addShow,
    updateShow: formState.updateShow,
    deleteShow: formState.deleteShow,
    addTicket: formState.addTicket,
    updateTicket: formState.updateTicket,
    deleteTicket: formState.deleteTicket
  };
};
