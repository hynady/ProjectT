import { BaseService } from '@/commons/base.service';
import { 
  OrganizerOccaUnit, 
  CreateOccaPayload, 
  CreateOccaResponse,
  Page,
  OccaFilterParams,
  OccaSubmitForApprovalPayload,
  ShowResponse,
  OccaFormData
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

  getOccas(params: OccaFilterParams): Promise<Page<OrganizerOccaUnit>> {
    return this.request({
      method: 'GET',
      url: '/organize/occas',
      data: params,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          // Clone the data to avoid mutating original
          const allEvents = [...organizeMockData.occas];
          
          // Apply filters
          let filteredEvents = allEvents;
          
          // Filter by status if provided
          if (params.status) {
            filteredEvents = filteredEvents.filter(event => event.approvalStatus === params.status);
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
              } else if (params.sort === 'location') {
                return a.location.localeCompare(b.location) * direction;
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

          resolve({
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
          });
        }, 500);
      })
    });
  }

  async createOcca(data: CreateOccaPayload): Promise<CreateOccaResponse> {
    console.log("API call: createOcca with approval status:", data.approvalStatus);
    return this.request({
      method: 'POST',
      url: '/organize/occas',
      data,
      mockResponse: () => new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log("Mock API: Processing createOcca request");
          if (data.approvalStatus === 'pending' && !this.validateOccaForSubmission(data)) {
            console.error("Mock API: Validation failed for submission");
            reject(new Error("Vui lòng điền đầy đủ thông tin trước khi gửi duyệt"));
            return;
          }

          console.log("Mock API: Returning successful response");
          resolve({
            id: `org-${Date.now()}`,
            title: data.basicInfo.title,
            status: data.status,
            approvalStatus: data.approvalStatus
          });
        }, 1000);
      })
    });
  }

  async submitForApproval(payload: OccaSubmitForApprovalPayload): Promise<void> {
    return this.request({
      method: 'POST',
      url: `/organize/occas/${payload.id}/submit`,
      data: { notes: payload.notes },
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(), 1000);
      })
    });
  }

  private validateOccaForSubmission(data: CreateOccaPayload): boolean {
    return Boolean(
      data.basicInfo?.title &&
      data.basicInfo?.location &&
      data.shows?.length > 0 &&
      data.tickets?.length > 0 &&
      data.gallery?.length > 0
    );
  }

  async getShowsByOccaId(occaId: string): Promise<ShowResponse[]> {
    return this.request({
      method: 'GET',
      url: `/organize/occas/${occaId}/shows`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          const mockShows = organizeMockData.showsByOccaId(occaId);
          resolve(mockShows);
        }, 800);
      })
    });
  }

  async getOccaById(id: string): Promise<OccaFormData> {
    return this.request({
      method: 'GET',
      url: `/organize/occas/${id}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          // Generate a mock full occa with all details based on basic info from mock data
          const basicInfo = organizeMockData.occas.find(occa => occa.id === id);
          
          if (!basicInfo) {
            throw new Error(`Occa with ID ${id} not found`);
          }
          
          // Get mock shows for this occa
          const shows = organizeMockData.showsByOccaId(id).map(show => ({
            id: show.id,
            date: show.date,
            time: show.time
          }));
          
          // Create mock tickets from the shows
          const tickets = [];
          for (const show of organizeMockData.showsByOccaId(id)) {
            for (const ticket of show.tickets) {
              tickets.push({
                id: ticket.id,
                showId: show.id,
                type: ticket.type,
                price: ticket.price,
                availableQuantity: ticket.available
              });
            }
          }
          
          // Generate mock gallery items
          const gallery = Array(Math.floor(Math.random() * 5) + 1)
            .fill(0)
            .map((_, i) => ({
              id: `gallery-${id}-${i}`,
              image: `https://picsum.photos/seed/${id}-${i}/800/600`
            }));
          
          resolve({
            basicInfo: {
              title: basicInfo.title,
              artist: "Various Artists", // Mock data
              location: basicInfo.location,
              address: "123 Example Street, City", // Mock address
              duration: 120, // Default duration
              description: JSON.stringify([
                {
                  type: 'paragraph',
                  children: [{ text: 'This is a mock description for the event.' }],
                },
              ]),
              bannerUrl: basicInfo.image || "",
            },
            shows,
            tickets,
            gallery
          });
        }, 800);
      })
    });
  }
  
  async updateOcca(id: string, data: CreateOccaPayload): Promise<CreateOccaResponse> {
    console.log("API call: updateOcca for ID:", id, "with approval status:", data.approvalStatus);
    return this.request({
      method: 'PUT',
      url: `/organize/occas/${id}`,
      data,
      mockResponse: () => new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log("Mock API: Processing updateOcca request");
          if (data.approvalStatus === 'pending' && !this.validateOccaForSubmission(data)) {
            console.error("Mock API: Validation failed for submission");
            reject(new Error("Vui lòng điền đầy đủ thông tin trước khi gửi duyệt"));
            return;
          }

          console.log("Mock API: Returning successful response");
          resolve({
            id,
            title: data.basicInfo.title,
            status: data.status,
            approvalStatus: data.approvalStatus
          });
        }, 1000);
      })
    });
  }
}

export const organizeService = OrganizeService.getInstance();
