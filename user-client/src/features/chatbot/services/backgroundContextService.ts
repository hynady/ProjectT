import { BaseService } from '@/commons/base.service';

export interface BackgroundContext {
  id?: number;
  title: string;
  content: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackgroundContextStats {
  total: number;
  active: number;
}

class BackgroundContextService extends BaseService {
  /**
   * Get all background contexts with pagination
   */
  async getAllContexts(page: number = 0, size: number = 10): Promise<BackgroundContext[]> {
    return this.request({
      method: 'GET',
      url: `/chat/background-context?page=${page}&size=${size}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          const mockContexts: BackgroundContext[] = [
            {
              id: 1,
              title: 'Hỗ trợ khách hàng',
              content: 'Bạn là một chatbot hỗ trợ khách hàng thông minh và hữu ích cho hệ thống quản lý vé. Hãy trả lời một cách lịch sự, chính xác và hữu ích về các vấn đề liên quan đến vé, sự kiện, và dịch vụ khách hàng.',
              isActive: true,
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              updatedAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: 2,
              title: 'Thông tin sản phẩm',
              content: 'Hãy cung cấp thông tin chi tiết về các loại vé, giá cả, và các sự kiện có sẵn. Luôn khuyến khích khách hàng mua vé và tham gia các hoạt động.',
              isActive: false,
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              updatedAt: new Date(Date.now() - 7200000).toISOString()
            }
          ];
          resolve(mockContexts);
        }, 500);
      }),
      defaultValue: []
    });
  }

  /**
   * Get a specific background context by ID
   */
  async getContextById(id: number): Promise<BackgroundContext | null> {
    return this.request({
      method: 'GET',
      url: `/chat/background-context/${id}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: 1,
            title: 'Hỗ trợ khách hàng',
            content: 'Bạn là một chatbot hỗ trợ khách hàng thông minh và hữu ích cho hệ thống quản lý vé. Hãy trả lời một cách lịch sự, chính xác và hữu ích về các vấn đề liên quan đến vé, sự kiện, và dịch vụ khách hàng.',
            isActive: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString()
          });
        }, 300);
      }),
      defaultValue: null
    });
  }

  /**
   * Create a new background context
   */
  async createContext(context: Omit<BackgroundContext, 'id' | 'createdAt' | 'updatedAt'>): Promise<BackgroundContext> {
    return this.request({
      method: 'POST',
      url: '/chat/background-context',
      data: context,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: Date.now(),
            ...context,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }, 800);
      })
    });
  }

  /**
   * Update an existing background context
   */
  async updateContext(id: number, context: Omit<BackgroundContext, 'id' | 'createdAt' | 'updatedAt'>): Promise<BackgroundContext> {
    return this.request({
      method: 'PUT',
      url: `/chat/background-context/${id}`,
      data: context,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id,
            ...context,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString()
          });
        }, 800);
      })
    });
  }

  /**
   * Delete a background context (soft delete)
   */
  async deleteContext(id: number): Promise<void> {
    return this.request({
      method: 'DELETE',
      url: `/chat/background-context/${id}`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve(undefined), 500);
      }),
      defaultValue: undefined
    });
  }

  /**
   * Toggle active status of a background context
   */
  async toggleActiveStatus(id: number): Promise<BackgroundContext> {
    return this.request({
      method: 'PATCH',
      url: `/chat/background-context/${id}/toggle-active`,
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id,
            title: 'Hỗ trợ khách hàng',
            content: 'Mock updated context',
            isActive: Math.random() > 0.5,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString()
          });
        }, 500);
      })
    });
  }
  /**
   * Get background context statistics
   */
  async getContextStats(): Promise<BackgroundContextStats> {
    return this.request({
      method: 'GET',
      url: '/chat/background-context/stats',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            total: 5,
            active: 1 // Changed to 1 since only one can be active now
          });
        }, 300);
      }),
      defaultValue: { total: 0, active: 0 }
    });
  }

  /**
   * Get the currently active background context
   */
  async getCurrentActiveContext(): Promise<BackgroundContext | null> {
    return this.request({
      method: 'GET',
      url: '/chat/background-context/current',
      mockResponse: () => new Promise((resolve) => {
        setTimeout(() => resolve({
          id: 1,
          title: 'E-commerce Support Context',
          content: 'You are a helpful customer service assistant for an e-commerce platform. Always be polite and professional.',
          isActive: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString()
        }), 300);
      }),
      defaultValue: null
    });
  }
}

export const backgroundContextService = new BackgroundContextService();
