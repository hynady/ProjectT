export interface OrganizerOccaUnit {
  id: string;
  title: string;
  location: string;
  image?: string;
  approvalStatus: OccaApprovalStatus;
  approvalMessage?: string; // For rejection messages
}

export interface BasicInfoFormData {
  title: string;
  artist: string;
  location: string;
  address: string;
  duration: number;
  description: string;
  bannerUrl: string;
  bannerFile?: File;
}

export interface ShowFormData {
  id?: string;
  date: string;
  time: string;
}

export interface TicketFormData {
  id?: string;
  showId: string;
  type: string;
  price: number;
  availableQuantity: number;
}

export interface GalleryItem {
  id?: string;
  image: string;
  file?: File;
}

export interface OccaFormData {
  basicInfo: BasicInfoFormData;
  shows: ShowFormData[];
  tickets: TicketFormData[];
  gallery: GalleryItem[];
}

export interface CreateOccaPayload extends OccaFormData {
  status: string;
  approvalStatus: OccaApprovalStatus;
}

export interface CreateOccaResponse {
  id: string;
  title: string;
  status: string;
  approvalStatus: OccaApprovalStatus;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface OccaFilterParams {
  page: number;
  size: number;
  status?: string;
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export type OccaApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected';

// New type for submission
export interface OccaSubmitForApprovalPayload {
  id: string;
  notes?: string;
}
