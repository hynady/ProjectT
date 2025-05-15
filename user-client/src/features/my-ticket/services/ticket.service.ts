import { BaseService } from "@/commons/base.service";
import { TicketDisplayUnit } from "../internal-types/ticket.type";
import { ticketMockData } from "./ticket.mock";

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

  async getActiveTickets(): Promise<TicketDisplayUnit[]> {
    return this.request({
      method: 'GET',
      url: '/tickets/active',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(ticketMockData.tickets), 1000);
      }),
      defaultValue: []
    });
  }

  async getUsedTickets(): Promise<TicketDisplayUnit[]> {
    return this.request({
      method: 'GET', 
      url: '/tickets/used',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(ticketMockData.tickets), 1000);
      }),
      defaultValue: []
    });
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