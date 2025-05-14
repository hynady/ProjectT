import { BaseService } from '@/commons/base.service';
import { TicketFilterParams, TicketListResponse } from '../internal-types/ticket.type';
import { ticketMockData } from './ticket.mock';

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

  /**
   * Get tickets for the organizer with pagination and filtering options
   */
  getTickets(params: TicketFilterParams): Promise<TicketListResponse> {
    // Create URLSearchParams for query string
    const searchParams = new URLSearchParams();
    
    // Add parameters to the search params
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.direction) searchParams.append('direction', params.direction);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.ticketType) searchParams.append('ticketType', params.ticketType);
    if (params.checkedIn !== undefined) searchParams.append('checkedIn', params.checkedIn.toString());
    
    return this.request({
      method: 'GET',
      url: `/shows/${params.showId}/tickets?${searchParams.toString()}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          // Clone the data to avoid mutating original
          let allTickets = [...ticketMockData.tickets];
          
          // Apply filters
          // Filter by search term if provided
          if (params.search) {
            const searchTerm = params.search.toLowerCase();
            allTickets = allTickets.filter(ticket => 
              ticket.recipientName.toLowerCase().includes(searchTerm) || 
              ticket.recipientEmail.toLowerCase().includes(searchTerm) ||
              ticket.recipientPhone.includes(searchTerm) ||
              ticket.ticketId.toLowerCase().includes(searchTerm) ||
              ticket.occaTitle.toLowerCase().includes(searchTerm)
            );
          }
          
          // Filter by showId if provided
          if (params.showId) {
            allTickets = allTickets.filter(ticket => ticket.showId === params.showId);
          }
          
          // Filter by ticketType if provided
          if (params.ticketType) {
            allTickets = allTickets.filter(ticket => ticket.ticketType === params.ticketType);
          }
          
          // Filter by checked in status if provided
          if (params.checkedIn !== undefined) {
            allTickets = allTickets.filter(ticket => 
              params.checkedIn ? ticket.checkedInAt !== null : ticket.checkedInAt === null
            );
          }
          
          // Filter by date range if provided
          if (params.startDate && params.endDate) {
            const startDate = new Date(params.startDate);
            const endDate = new Date(params.endDate);
            
            allTickets = allTickets.filter(ticket => {
              const showDateParts = ticket.showDate.split('/');
              const showDate = new Date(`${showDateParts[2]}-${showDateParts[1]}-${showDateParts[0]}`);
              return showDate >= startDate && showDate <= endDate;
            });
          }
          
          // Apply sorting
          if (params.sort) {
            allTickets.sort((a, b) => {
              const direction = params.direction === 'desc' ? -1 : 1;
              
              switch (params.sort) {
                case 'purchasedAt':
                  return (new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime()) * direction;
                case 'showDate': {
                  const aDateParts = a.showDate.split('/');
                  const bDateParts = b.showDate.split('/');
                  const aDate = new Date(`${aDateParts[2]}-${aDateParts[1]}-${aDateParts[0]}`);
                  const bDate = new Date(`${bDateParts[2]}-${bDateParts[1]}-${bDateParts[0]}`);
                  return (aDate.getTime() - bDate.getTime()) * direction;
                }
                case 'ticketPrice':
                  return (a.ticketPrice - b.ticketPrice) * direction;
                case 'recipientName':
                  return a.recipientName.localeCompare(b.recipientName) * direction;
                case 'occaTitle':
                  return a.occaTitle.localeCompare(b.occaTitle) * direction;
                default:
                  return 0;
              }
            });
          }
          
          // Apply pagination
          const totalElements = allTickets.length;
          const totalPages = Math.ceil(totalElements / (params.size || 10));
          const start = (params.page || 0) * (params.size || 10);
          const end = start + (params.size || 10);
          const paginatedTickets = allTickets.slice(start, end);
          
          resolve({
            tickets: paginatedTickets,
            page: params.page || 0,
            size: params.size || 10,
            totalElements,
            totalPages
          });
        }, 500);
      })
    });
  }
}

export const ticketService = TicketService.getInstance();
