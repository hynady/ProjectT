export interface OrganizerOccaUnit {
  id: string;
  title: string;
  location: string;
  image?: string;
  approvalStatus: OccaApprovalStatus;
  approvalMessage?: string; // For rejection messages
}

export interface RegionType {
  id: string;
  name: string;
}

export interface BasicInfoFormData {
  title: string;  artist: string;
  organizer: string; // Added organizer field
  location: string;
  address: string;
  description: string;
  bannerUrl: string;
  bannerFile?: File;
  categoryId: string; // Add category ID field (required)
  regionId: string; // Add region ID field (required)
}

export interface ShowFormData {
  id?: string;
  date: string;
  time: string;
  saleStatus?: ShowSaleStatus;
  autoUpdateStatus?: boolean;
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
  approvalStatus?: OccaApprovalStatus; // Add approval status to form data for editing
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

export interface ShowResponse {
  id: string;
  date: string;
  time: string;
  saleStatus: ShowSaleStatus; // Renamed from status to saleStatus
  tickets: {
    id: string;
    type: string;
    price: number;
    available: number;
    sold?: number;
  }[];
  autoUpdateStatus?: boolean;
}

// New type for show sale status
export type ShowSaleStatus = 'upcoming' | 'on_sale' | 'sold_out' | 'ended';

// Category type for dropdown selection
export interface CategoryType {
  id: string;
  name: string;
}