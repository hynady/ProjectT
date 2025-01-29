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
      defaultValue?: T;
    }
  ): Promise<T> {
    try {
      if (this.isMockEnabled && config.mockResponse) {
        return await config.mockResponse();
      }

      const response = await axiosInstance({
        method: config.method,
        url: config.url,
        data: config.data
      });
      
      return response.data;
    } catch (error) {
      console.error(`API request failed: ${config.url}`, error);
      // Return default value if provided, otherwise rethrow
      if (config.defaultValue !== undefined) {
        return config.defaultValue;
      }
      throw error;
    }
  }
}