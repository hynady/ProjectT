import { BaseService } from '@/commons/base.service';

export type UserRole = 'role_admin' | 'role_user';

class RoleService extends BaseService {
  private static instance: RoleService;

  private constructor() {
    super();
  }

  public static getInstance(): RoleService {
    if (!RoleService.instance) {
      RoleService.instance = new RoleService();
    }
    return RoleService.instance;
  }  /**
   * Fetches the current user's role from the server
   * @param skipCache If true, forces a fresh API call by bypassing the request cache
   * @returns Promise resolving to the user's role
   */
  getUserRole(skipCache = false): Promise<UserRole> {
    return this.request({
      method: 'GET',
      url: skipCache ? `/user/role?_t=${Date.now()}` : '/user/role', // Add timestamp to force fresh request
      mockResponse: () => Promise.resolve('role_user'),
      // Return a default value in case of an error
      defaultValue: 'role_user'
    });
  }
  
  /**
   * Checks if the current user has admin role
   * @param skipCache If true, bypasses any request caching
   * @returns Promise resolving to boolean indicating admin status
   */
  async isUserAdmin(skipCache = false): Promise<boolean> {
    try {
      const role = await this.getUserRole(skipCache);
      return role === 'role_admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Checks if the current user has admin privileges
   * @param skipCache If true, bypasses any request caching
   * @returns Promise resolving to boolean indicating admin status
   */
  async isAdmin(skipCache = false): Promise<boolean> {
    try {
      const role = await this.getUserRole(skipCache);
      return role === 'role_admin';
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  }
}

export const roleService = RoleService.getInstance();
