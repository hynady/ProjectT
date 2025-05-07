import { Route, Routes } from 'react-router-dom';
import AdminDashboardPage from './AdminDashboardPage';
import ContentApprovalPage from './ContentApprovalPage';
import UsersManagementPage from './UsersManagementPage';
import { AdminRequiredAuth } from './components/AdminRequiredAuth';
import { AdminRoleMonitor } from './components/AdminRoleMonitor';

export default function AdminRoutes() {
  return (
    <>
      {/* Monitor changes to admin role and redirect if access is lost */}
      <AdminRoleMonitor />
      
      <Routes>
        <Route element={<AdminRequiredAuth />}>
          <Route path="/" element={<AdminDashboardPage />} />
          <Route path="/approval" element={<ContentApprovalPage />} />
          <Route path="/users" element={<UsersManagementPage />} />
          <Route path="/events" element={<div>Events Management Page (Coming Soon)</div>} />
          <Route path="/analytics" element={<div>Analytics Page (Coming Soon)</div>} />
          <Route path="/reports" element={<div>Reports Page (Coming Soon)</div>} />
          <Route path="/settings" element={<div>Admin Settings Page (Coming Soon)</div>} />
        </Route>
      </Routes>
    </>
  );
}
