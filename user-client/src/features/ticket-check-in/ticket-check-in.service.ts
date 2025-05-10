import { BaseService } from '@/commons/base.service';

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
  }
}

export const ticketCheckInService = new TicketCheckInService();