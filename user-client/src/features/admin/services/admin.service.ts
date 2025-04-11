import { BaseService } from '@/commons/base.service';
import { 
  AdminOccaUnit, 
  Page,
  OccaFilterParams,
  OccaStatistics,
  AdminUserInfo,
  AdminUserFilterParams,
  AdminOccaDetail
} from '../internal-types/admin.type';
import { 
  mockOccas, 
  mockUsers, 
  mockStatistics, 
  mockSlateDescription, 
  mockShows,
  mockTickets 
} from './admin.mock';

class AdminService extends BaseService {
  private static instance: AdminService;

  private constructor() {
    super();
  }

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  getOccas(params: OccaFilterParams): Promise<Page<AdminOccaUnit>> {
    const searchParams = new URLSearchParams();
    
        // Thêm các tham số vào searchParams
        if (params.page !== undefined) searchParams.append('page', params.page.toString());
        if (params.size !== undefined) searchParams.append('size', params.size.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.status) searchParams.append('status', params.status);
        if (params.sort) searchParams.append('sort', params.sort);
        if (params.direction) searchParams.append('direction', params.direction);
    
    return this.request({
      method: 'GET',
      url: `/approval/occas?${searchParams.toString()}`,
      mockResponse: () => this.getMockOccas(params)
    });
  }

  getOccaDetail(occaId: string): Promise<AdminOccaDetail> {
    return this.request({
      method: 'GET',
      url: `/approval/occas/${occaId}/detail`,
      mockResponse: () => this.getMockOccaDetail(occaId)
    });
  }
  updateOccaStatus(occaId: string, data: { status: string; rejectionReason?: string }): Promise<void> {
    return this.request({
      method: 'PUT',
      url: `/approval/occas/${occaId}/status`,
      data: data,
      mockResponse: () => {
        if (data.status === 'approved') {
          return this.getMockApproveOcca();
        } else if (data.status === 'rejected') {
          return this.getMockRejectOcca();
        }
        return Promise.resolve();
      }
    });
  }

  getDashboardStatistics(): Promise<OccaStatistics> {
    return this.request({
      method: 'GET',
      url: '/admin/statistics',
      mockResponse: () => this.getMockDashboardStatistics()
    });
  }

  getUsersList(params: AdminUserFilterParams): Promise<Page<AdminUserInfo>> {
    return this.request({
      method: 'GET',
      url: '/admin/users',
      data: params,
      mockResponse: () => this.getMockUsersList(params)
    });
  }

  // Mock implementations
  private getMockOccas(params: OccaFilterParams): Promise<Page<AdminOccaUnit>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Apply filters
        let filteredOccas = [...mockOccas];
        
        // Filter by status if provided
        if (params.status && params.status !== 'all') {
          filteredOccas = filteredOccas.filter(occa => occa.approvalStatus === params.status);
        }
        
        // Filter by search term if provided
        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          filteredOccas = filteredOccas.filter(occa => 
            occa.title.toLowerCase().includes(searchTerm) || 
            occa.location.toLowerCase().includes(searchTerm) ||
            occa.organizerName.toLowerCase().includes(searchTerm)
          );
        }
        
        // Apply sorting
        if (params.sort) {
          filteredOccas.sort((a, b) => {
            const direction = params.direction === 'desc' ? -1 : 1;
            if (params.sort === 'title') {
              return a.title.localeCompare(b.title) * direction;
            } else if (params.sort === 'location') {
              return a.location.localeCompare(b.location) * direction;
            } else if (params.sort === 'submittedAt') {
              return (new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()) * direction;
            }
            return 0;
          });
        }
        
        // Apply pagination
        const totalElements = filteredOccas.length;
        const totalPages = Math.ceil(totalElements / params.size);
        const start = params.page * params.size;
        const end = start + params.size;
        const paginatedOccas = filteredOccas.slice(start, end);

        resolve({
          content: paginatedOccas,
          pageable: {
            pageNumber: params.page,
            pageSize: params.size,
            sort: { 
              empty: !params.sort, 
              sorted: !!params.sort, 
              unsorted: !params.sort 
            },
            offset: start,
            paged: true,
            unpaged: false
          },
          totalPages,
          totalElements,
          last: params.page >= totalPages - 1,
          size: params.size,
          number: params.page,
          sort: {
            empty: !params.sort,
            sorted: !!params.sort,
            unsorted: !params.sort
          },
          numberOfElements: paginatedOccas.length,
          first: params.page === 0,
          empty: paginatedOccas.length === 0
        });
      }, 800);
    });
  }

  private getMockOccaDetail(occaId: string): Promise<AdminOccaDetail> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Get basic info from mock list first
        const baseOcca = mockOccas.find(o => o.id === occaId);
        
        if (!baseOcca) {
          reject(new Error("Occa not found"));
          return;
        }

        // Get mock slate description
        const slateDescription = mockSlateDescription.content;

        // Create detailed mockup based on the basic info
        resolve({
          id: baseOcca.id,
          basicInfo: {
            title: baseOcca.title,
            organizerName: baseOcca.organizerName,
            location: baseOcca.location,
            address: "123 Example Street, District 1, Ho Chi Minh City",
            description: slateDescription,
            bannerUrl: baseOcca.image || "",
          },
          shows: mockShows,
          tickets: mockTickets,
          gallery: Array(6).fill(0).map((_, i) => ({
            id: `gallery-${i}`,
            url: baseOcca.image || `https://placehold.co/600x400?text=Gallery+Image+${i+1}`
          })),
          submissionDetails: {
            submittedAt: baseOcca.submittedAt,
            approvalStatus: baseOcca.approvalStatus,
            approvedAt: baseOcca.approvedAt,
            rejectedAt: baseOcca.rejectedAt,
            rejectionReason: baseOcca.rejectionReason
          }
        });
      }, 1000);
    });
  }

  private getMockApproveOcca(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
  }

  private getMockRejectOcca(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
  }

  private getMockDashboardStatistics(): Promise<OccaStatistics> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockStatistics);
      }, 800);
    });
  }

  private getMockUsersList(params: AdminUserFilterParams): Promise<Page<AdminUserInfo>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Apply filtering and pagination
        let filteredUsers = [...mockUsers];
        
        // Filter by role if provided
        if (params.role && params.role !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.role === params.role);
        }
        
        // Filter by status if provided
        if (params.status && params.status !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.status === params.status);
        }
        
        // Filter by search term if provided
        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm) || 
            user.email.toLowerCase().includes(searchTerm)
          );
        }
        
        // Apply pagination
        const totalElements = filteredUsers.length;
        const totalPages = Math.ceil(totalElements / params.size);
        const start = params.page * params.size;
        const end = start + params.size;
        const paginatedUsers = filteredUsers.slice(start, end);

        resolve({
          content: paginatedUsers,
          pageable: {
            pageNumber: params.page,
            pageSize: params.size,
            sort: { 
              empty: !params.sort, 
              sorted: !!params.sort, 
              unsorted: !params.sort 
            },
            offset: start,
            paged: true,
            unpaged: false
          },
          totalPages,
          totalElements,
          last: params.page >= totalPages - 1,
          size: params.size,
          number: params.page,
          sort: {
            empty: !params.sort,
            sorted: !!params.sort,
            unsorted: !params.sort
          },
          numberOfElements: paginatedUsers.length,
          first: params.page === 0,
          empty: paginatedUsers.length === 0
        });
      }, 800);
    });
  }
}

export const adminService = AdminService.getInstance();