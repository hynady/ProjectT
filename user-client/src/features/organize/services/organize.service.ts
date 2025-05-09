import { BaseService } from '@/commons/base.service';
import { 
  OrganizerOccaUnit, 
  CreateOccaPayload, 
  CreateOccaResponse,
  Page,
  OccaFilterParams,
  ShowResponse,
  OccaFormData,
  CategoryType
} from '../internal-types/organize.type';
import { organizeMockData } from './organize.mock';
import { 
  AddShowPayload, 
  UpdateShowPayload, 
  AddTicketPayload, 
  UpdateTicketPayload,
  TicketResponse
} from '../internal-types/show-operations.type';

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
    // Tạo đối tượng URLSearchParams để xây dựng query string
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
      url: `/organize/occas?${searchParams.toString()}`,
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
  
  private validateOccaForSubmission(data: CreateOccaPayload): boolean {
    return Boolean(
      data.basicInfo?.title &&
      data.basicInfo?.location &&
      data.basicInfo?.categoryId && // Add check for categoryId
      data.shows?.length > 0 &&
      data.tickets?.length > 0 &&
      data.gallery?.length > 0
    );
  }

  async getShowsByOccaId(occaId: string): Promise<ShowResponse[]> {
    return this.request({
      method: 'GET',
      url: `/shows/organize/${occaId}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          const mockShows = organizeMockData.showsByOccaId(occaId);
          resolve(mockShows);
        }, 800);
      })
    });
  }

  // SHOWS MANAGEMENT
  async addShow(occaId: string, showData: AddShowPayload): Promise<ShowResponse> {
    return this.request({
      method: 'POST',
      url: `/shows/occas/${occaId}/shows`,
      data: showData,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          const newId = `show-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          resolve({
            id: newId,
            date: showData.date,
            time: showData.time,
            saleStatus: showData.saleStatus,
            autoUpdateStatus: showData.autoUpdateStatus,
            tickets: []
          });
        }, 500);
      })
    });
  }

  async updateShow(occaId: string, showId: string, showData: UpdateShowPayload): Promise<ShowResponse> {
    return this.request({
      method: 'PUT',
      url: `/organize/occas/${occaId}/shows/${showId}`,
      data: showData,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          const mockShows = organizeMockData.showsByOccaId(occaId);
          const show = mockShows.find(s => s.id === showId);
          
          if (!show) {
            throw new Error('Show not found');
          }
          
          const updatedShow = {
            ...show,
            date: showData.date || show.date,
            time: showData.time || show.time,
            saleStatus: (showData.saleStatus) || show.saleStatus,
            autoUpdateStatus: showData.autoUpdateStatus ?? show.autoUpdateStatus
          };
          
          resolve(updatedShow);
        }, 500);
      })
    });
  }

  async deleteShow(occaId: string, showId: string): Promise<void> {
    return this.request({
      method: 'DELETE',
      url: `/organize/occas/${occaId}/shows/${showId}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      })
    });
  }

  // TICKETS MANAGEMENT
  async addTicket(occaId: string, showId: string, ticketData: AddTicketPayload): Promise<TicketResponse> {
    return this.request({
      method: 'POST',
      url: `/organize/occas/${occaId}/shows/${showId}/tickets`,
      data: ticketData,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          const newId = `ticket-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          resolve({
            id: newId,
            type: ticketData.type,
            price: ticketData.price,
            available: ticketData.availableQuantity
          });
        }, 500);
      })
    });
  }

  async updateTicket(occaId: string, showId: string, ticketId: string, ticketData: UpdateTicketPayload): Promise<TicketResponse> {
    return this.request({
      method: 'PUT',
      url: `/organize/occas/${occaId}/shows/${showId}/tickets/${ticketId}`,
      data: ticketData,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          const mockShows = organizeMockData.showsByOccaId(occaId);
          const show = mockShows.find(s => s.id === showId);
          
          if (!show) {
            throw new Error('Show not found');
          }
          
          const ticket = show.tickets.find(t => t.id === ticketId);
          
          if (!ticket) {
            throw new Error('Ticket not found');
          }
          
          const updatedTicket = {
            ...ticket,
            type: ticketData.type || ticket.type,
            price: ticketData.price ?? ticket.price,
            available: ticketData.availableQuantity ?? ticket.available
          };
          
          resolve(updatedTicket);
        }, 500);
      })
    });
  }

  async deleteTicket(occaId: string, showId: string, ticketId: string): Promise<void> {
    return this.request({
      method: 'DELETE',
      url: `/organize/occas/${occaId}/shows/${showId}/tickets/${ticketId}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
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
          
          // Generate a random category ID (1-8)
          const categoryId = (parseInt(id.replace(/\D/g, '')) % 8 + 1).toString();
          
          resolve({
            basicInfo: {
              title: basicInfo.title,
              artist: "Various Artists", // Mock data
              location: basicInfo.location,
              address: "123 Example Street, City", // Mock address
              description: JSON.stringify([
                {
                  type: 'paragraph',
                  children: [{ text: 'This is a mock description for the event.' }],
                },
              ]),
              bannerUrl: basicInfo.image || "",
              categoryId: categoryId, // Add category ID to the returned data
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
  async getCategories(): Promise<CategoryType[]> {
    return this.request({
      method: 'GET',
      url: '/occas/categories',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(organizeMockData.categories), 500);
      })
    });
  }
}

export const organizeService = OrganizeService.getInstance();
