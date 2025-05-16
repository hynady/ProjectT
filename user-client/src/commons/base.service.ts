/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/commons/lib/utils/axios";
import { env } from '@/env-config';

export class BaseService {
  protected isMockEnabled: boolean;

  constructor() {
    this.isMockEnabled = env.VITE_ENABLE_MOCK === 'true';
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
      }) as T; // Type assertion here since interceptor unwraps to T
      
      return response;
    } catch (error) {
      // console.error(`API request failed: ${config.url}`, error);
      if (config.defaultValue !== undefined) {
        return config.defaultValue;
      }
      throw error;
    }
  }
}