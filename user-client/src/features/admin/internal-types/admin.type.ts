export type OccaApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type UserRole = 'role_user' | 'role_admin';
export type UserStatus = 'active' | 'inactive';
export type ActivityType = 'occa_submitted' | 'occa_approved' | 'occa_rejected' | 'user_registered' | 'user_login';

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

export interface AdminUserFilterParams {
  page: number;
  size: number;
  role?: string;
  status?: string;
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface AdminOccaUnit {
  id: string;
  title: string;
  organizerName: string;
  location: string;
  image?: string;
  approvalStatus: OccaApprovalStatus;
  submittedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface AdminOccaDetail {
  id: string;
  basicInfo: {
    title: string;
    organizerName: string;
    location: string;
    address: string;
    description: string;
    bannerUrl: string;
  };
  shows: Array<{
    id: string;
    date: string;
    time: string;
  }>;
  tickets: Array<{
    id: string;
    type: string;
    price: number;
    quantity: number;
  }>;
  gallery: Array<{
    id: string;
    url: string;
  }>;
  submissionDetails: {
    submittedAt: string;
    approvalStatus: OccaApprovalStatus;
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
  };
}

export interface OccaApprovalPayload {
  notes?: string;
  status: OccaApprovalStatus;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  timestamp: string;
  actor: string;
}

export interface OccaStatistics {
  totalOccas: number;
  approvedOccas: number;
  pendingOccas: number;
  rejectedOccas: number;
  totalUsers: number;
  ticketsSold: number;
  totalRevenue: number;
  recentActivity: ActivityItem[];
}

export interface AdminUserInfo {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastActive: string;
}

export interface UserProfileCard {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  isDefault: boolean;
}

export interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
  lastActive: string;
  stats: {
    eventsAttended: number;
    eventsOrganized?: number;
    ticketsPurchased: number;
    totalSpent: number;
  };
  profiles: UserProfileCard[];
}
