import { roleService } from '../services/role.service';

/**
 * Check if the current user has admin role access
 * @param forceCheck If true, bypass cache and force a fresh API check
 * @returns Promise<boolean> indicating whether user has admin access
 */
export async function checkAdminAccess(forceCheck = false): Promise<boolean> {
  try {
    // Check sessionStorage first for cached result to avoid unnecessary API calls
    // but only if we're not forcing a fresh check
    if (!forceCheck) {
      const cachedStatus = sessionStorage.getItem('userAdminStatus');
      if (cachedStatus) {
        return cachedStatus === 'true';
      }
    }
    
    // If no cached result or force check requested, make the API call
    const role = await roleService.getUserRole();
    const isAdmin = role === 'role_admin';
    
    // Cache the result in sessionStorage
    sessionStorage.setItem('userAdminStatus', isAdmin ? 'true' : 'false');
    
    return isAdmin;
  } catch (error) {
    console.error('Error checking admin access:', error);
    
    // In case of error, clear any cached status
    sessionStorage.removeItem('userAdminStatus');
    return false;
  }
}

/**
 * Clear cached admin status, useful when logging out or when status might have changed
 */
export function clearAdminStatus(): void {
  sessionStorage.removeItem('userAdminStatus');
}
