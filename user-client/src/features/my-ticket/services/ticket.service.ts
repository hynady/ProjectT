import { BaseService } from "@/commons/base.service";
import { TicketDisplayUnit } from "../internal-types/ticket.type";
import { ticketMockData } from "./ticket.mock";

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export type TicketFilter = 'ACTIVE' | 'USED' | 'ALL';

class TicketService extends BaseService {
  private static instance: TicketService;

  private constructor() {
    super();
  }

  public static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService();
    }
    return TicketService.instance;
  }
  async getTickets(
    filter: TicketFilter = 'ACTIVE',
    page: number = 0,
    size: number = 20,
    searchQuery?: string,
    sort: string = 'createdAt',
    direction: 'asc' | 'desc' = 'desc'
  ): Promise<PageResponse<TicketDisplayUnit>> {
    const params = new URLSearchParams({
      filter,
      page: page.toString(),
      size: size.toString(),
      sort,
      direction,
    });
      if (searchQuery) {
      params.append('query', searchQuery);
    }

    return this.request({
      method: 'GET',
      url: `/tickets?${params.toString()}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          const mockTickets = ticketMockData.tickets;
          let filteredTickets = mockTickets;
          
          // Apply filter
          if (filter === 'ACTIVE') {
            filteredTickets = mockTickets.filter(ticket => 
              !ticket.ticket.checkedInAt && new Date(ticket.show.date) > new Date()
            );
          } else if (filter === 'USED') {
            filteredTickets = mockTickets.filter(ticket => 
              ticket.ticket.checkedInAt || new Date(ticket.show.date) <= new Date()
            );
          }
          
          // Apply search
          if (searchQuery) {
            filteredTickets = filteredTickets.filter(ticket =>
              ticket.occa.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              ticket.occa.location.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          
          const totalElements = filteredTickets.length;
          const startIndex = page * size;
          const endIndex = Math.min(startIndex + size, totalElements);
          const content = filteredTickets.slice(startIndex, endIndex);
          
          resolve({
            content,
            totalElements,
            totalPages: Math.ceil(totalElements / size),
            size,
            number: page,
            first: page === 0,
            last: endIndex >= totalElements
          });
        }, 1000);
      }),
      defaultValue: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size,
        number: page,
        first: true,
        last: true
      }    });
  }

  async checkInTicket(ticketId: string): Promise<{ success: boolean }> {
    return this.request({
      method: 'POST',
      url: `/tickets/${ticketId}/check-in`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve({ success: true }), 800);
      }),
      defaultValue: { success: false }
    });
  }
}

export const ticketService = TicketService.getInstance();