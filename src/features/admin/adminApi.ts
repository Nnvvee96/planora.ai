/**
 * Admin Feature API
 * 
 * Public API boundary for admin-related functionality.
 * All external access to admin features must go through this file.
 */

// Export services
export { adminService } from './services/adminService';

// Export types
export type { AdminCheckResult, AdminUserProfile } from './services/adminService';

// Export components
export { AdminDashboard } from './components/AdminDashboard';
export { UserManagementTable } from './components/UserManagementTable'; 