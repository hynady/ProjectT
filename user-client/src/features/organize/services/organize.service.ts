import { BaseService } from '@/commons/base.service';
import { 
  OrganizerOccaUnit, 
  CreateOccaPayload, 
  CreateOccaResponse,
  Page,
  OccaFilterParams
} from '../internal-types/organize.type';
import { organizeMockData } from './organize.mock';

class OrganizeService extends BaseService {
  private static instance: OrganizeService;

  private constructor() {
    super();
  }

  public static getInstance(): OrganizeService {
    if (!OrganizeService.instance) {
      OrganizeService.instance = new OrganizeService();
    }
    return OrganizeService.instance;
  }

  async getOccasByType(type: string, organizerId: string): Promise<OrganizerOccaUnit[]> {
    return this.request({
      method: 'GET',
      url: `/organize/${type}?organizerId=${organizerId}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve(organizeMockData[type as keyof typeof organizeMockData] || []);
        }, 800);
      })
    });
  }

  async getOccas(params: OccaFilterParams): Promise<Page<OrganizerOccaUnit>> {
    // In a real app, this would make an API call
    // Simulate API response with our mock data
    console.log("Fetching events with params:", params);
    
    // Clone the data to avoid mutating original
    const allEvents = [...organizeMockData.upcoming, ...organizeMockData.past, ...organizeMockData.draft];
    
    // Apply filters
    let filteredEvents = allEvents;
    
    // Filter by status if provided
    if (params.status) {
      filteredEvents = filteredEvents.filter(event => event.status === params.status);
    }
    
    // Filter by search term if provided
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(searchTerm) || 
        event.location.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply sorting
    if (params.sort) {
      filteredEvents.sort((a, b) => {
        const direction = params.direction === 'desc' ? -1 : 1;
        
        if (params.sort === 'title') {
          return a.title.localeCompare(b.title) * direction;
        } else if (params.sort === 'date') {
          return (new Date(a.date).getTime() - new Date(b.date).getTime()) * direction;
        } else if (params.sort === 'location') {
          return a.location.localeCompare(b.location) * direction;
        } else if (params.sort === 'ticketSoldPercent') {
          const percentA = a.ticketsSold / (a.ticketsTotal || 1);
          const percentB = b.ticketsSold / (b.ticketsTotal || 1);
          return (percentA - percentB) * direction;
        }
        
        return 0;
      });
    }
    
    // Apply pagination
    const totalElements = filteredEvents.length;
    const totalPages = Math.ceil(totalElements / params.size);
    const start = params.page * params.size;
    const end = start + params.size;
    const paginatedEvents = filteredEvents.slice(start, end);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return paginated response in the expected format
    return {
      content: paginatedEvents,
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
      numberOfElements: paginatedEvents.length,
      first: params.page === 0,
      empty: paginatedEvents.length === 0
    };
  }

  async createOcca(data: CreateOccaPayload): Promise<CreateOccaResponse> {
    // Simulate API call
    console.log('Creating event with data:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock response
    return {
      id: `org-${Date.now()}`,
      title: data.basicInfo.title,
      status: data.status
    };
  }
}

export const organizeService = OrganizeService.getInstance();
