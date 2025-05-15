import { BaseService } from '@/commons/base.service';
import { TicketListResponse } from '@/features/organize/internal-types/ticket.type';

class TicketCheckInService extends BaseService {
  async verifyShowAuthCode(showAuthCode: string): Promise<{ exists: boolean; expiresAt: string }> {
    return this.request({
      method: 'GET',
      url: `/shows/validate-auth-code?code=${showAuthCode}`
    });
  }

  async checkInTicket(showAuthCode: string, ticketCode: string): Promise<{ success: boolean; message?: string }> {
    return this.request({
      method: 'POST',
      url: '/tickets/ticket-check-in',
      data: { showAuthCode, ticketCode }
    });
  }  async getTicketsByAuthCode(
    authCode: string, 
    params: { 
      page?: number; 
      size?: number; 
      sort?: string; 
      direction?: 'asc' | 'desc'; 
    }
  ): Promise<TicketListResponse> {
    return this.request({
      method: 'GET',
      url: `/shows/tickets/by-auth-code?authCode=${authCode}&page=${params.page || 0}&size=${params.size || 10}&sort=${params.sort || 'purchasedAt'}&direction=${params.direction || 'desc'}`
    });
  }
}

export const ticketCheckInService = new TicketCheckInService();