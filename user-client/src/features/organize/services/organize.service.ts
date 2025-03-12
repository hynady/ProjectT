import { BaseService } from '@/commons/base.service';
import { format, addDays } from 'date-fns';
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
    const { page, size, status, search, sort, direction } = params;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('size', String(size));
    
    if (status && status !== 'all') {
      queryParams.append('status', status);
    }
    
    if (search) {
      queryParams.append('search', search);
    }
    
    if (sort) {
      queryParams.append('sort', sort);
      queryParams.append('direction', direction || 'asc');
    }

    return this.request({
      method: 'GET',
      url: `/organize/occas?${queryParams.toString()}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          // Generate a larger dataset for better pagination testing
          const baseOccas = [
            ...organizeMockData.upcoming,
            ...organizeMockData.past,
            ...organizeMockData.draft
          ];
          
          // Add additional mock data to test pagination
          const additionalMockData: OrganizerOccaUnit[] = Array.from({ length: 30 }, (_, i) => ({
            id: `mock-${i + 100}`,
            title: `Mock Event ${i + 1}`,
            date: format(addDays(new Date(), i), 'yyyy-MM-dd'),
            location: `Location ${i % 5 + 1}, City ${i % 3 + 1}`,
            status: ['active', 'completed', 'draft'][i % 3] as string,
            ticketsSold: Math.floor(Math.random() * 100),
            ticketsTotal: 100,
            image: ''
          }));
          
          let allOccas = [...baseOccas, ...additionalMockData];
          
          // Apply status filter
          if (status && status !== 'all') {
            allOccas = allOccas.filter(occa => occa.status === status);
          }
          
          // Apply search filter
          if (search) {
            const searchLower = search.toLowerCase();
            allOccas = allOccas.filter(occa => 
              occa.title.toLowerCase().includes(searchLower) ||
              occa.location.toLowerCase().includes(searchLower)
            );
          }
          
          // Apply sorting
          if (sort) {
            const dir = direction === 'desc' ? -1 : 1;
            allOccas.sort((a, b) => {
              switch (sort) {
                case 'title':
                  return a.title.localeCompare(b.title) * dir;
                case 'date':
                  return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
                case 'location':
                  return a.location.localeCompare(b.location) * dir;
                case 'tickets':
                  return ((a.ticketsSold / a.ticketsTotal) - (b.ticketsSold / b.ticketsTotal)) * dir;
                default:
                  return 0;
              }
            });
          }
          
          // Paginate
          const totalElements = allOccas.length;
          const totalPages = Math.ceil(totalElements / size);
          const startIndex = page * size;
          const endIndex = Math.min(startIndex + size, totalElements);
          const paginatedOccas = allOccas.slice(startIndex, endIndex);
          
          console.log(`Serving page ${page} with ${size} items per page`);
          console.log(`Total items: ${allOccas.length}, Total pages: ${Math.ceil(allOccas.length / size)}`);
          
          resolve({
            content: paginatedOccas,
            pageable: {
              pageNumber: page,
              pageSize: size,
              sort: { empty: !sort, sorted: !!sort, unsorted: !sort },
              offset: page * size,
              paged: true,
              unpaged: false
            },
            totalPages,
            totalElements,
            last: page + 1 >= totalPages,
            size,
            number: page,
            sort: { empty: !sort, sorted: !!sort, unsorted: !sort },
            numberOfElements: paginatedOccas.length,
            first: page === 0,
            empty: paginatedOccas.length === 0
          });
        }, 100); // Shorter delay for better usability
      })
    });
  }

  async createOcca(data: CreateOccaPayload): Promise<CreateOccaResponse> {
    return this.request({
      method: 'POST',
      url: '/organize/occa',
      data,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          const newId = `new-${Date.now()}`;
          resolve({
            id: newId,
            title: data.basicInfo.title,
            status: data.status
          });
        }, 1500);
      })
    });
  }
}

export const organizeService = OrganizeService.getInstance();
