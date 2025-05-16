import { BaseService } from "@/commons/base.service";

interface ServerTimeResponse {
  serverTime: string;
}

class ServerTimeService extends BaseService {
  private static instance: ServerTimeService;

  private constructor() {
    super();
  }

  public static getInstance(): ServerTimeService {
    if (!ServerTimeService.instance) {
      ServerTimeService.instance = new ServerTimeService();
    }
    return ServerTimeService.instance;
  }

  async getServerTime(): Promise<Date> {
    try {
      const response = await this.request<ServerTimeResponse>({
        method: 'GET',
        url: '/v1/common/server-time',
        mockResponse: () => new Promise((resolve) => {
          // Mock response with current time
          setTimeout(() => {
            resolve({ serverTime: new Date().toISOString() });
          }, 200);
        })
      });
      
      return new Date(response.serverTime);
    } catch (error) {
      console.error("Failed to fetch server time:", error);
      // Return client time as fallback
      return new Date();
    }
  }
}

export const serverTimeService = ServerTimeService.getInstance();
