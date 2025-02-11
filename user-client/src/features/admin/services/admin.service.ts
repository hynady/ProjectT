import { BaseService } from "@/commons/base.service";

class AdminService extends BaseService {
  private static instance: AdminService;

  private constructor() {
    super();
  }

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  async pingServer(): Promise<string> {
    return this.request({
      method: 'GET',
      url: '/occa/ting'
    });
  }
}

export const adminService = AdminService.getInstance();