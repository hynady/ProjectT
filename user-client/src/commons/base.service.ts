import axiosInstance from "@/commons/lib/ultils/axios.ts";

export class BaseService {
  protected isMockEnabled: boolean;

  constructor() {
    this.isMockEnabled = import.meta.env.VITE_ENABLE_MOCK === 'true';
  }

  protected async request<T>(
    config: {
      method: string;
      url: string;
      data?: any;
      mockResponse?: () => Promise<T>;
    }
  ): Promise<T> {
    if (this.isMockEnabled && config.mockResponse) {
      return await config.mockResponse();
    }

    return await axiosInstance({
      method: config.method,
      url: config.url,
      data: config.data
    });
  }
}