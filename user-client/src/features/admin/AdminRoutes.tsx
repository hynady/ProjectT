import { Route, Routes } from 'react-router-dom';
import AdminDashboardPage from './AdminDashboardPage';
import ContentApprovalPage from './ContentApprovalPage';
import UsersManagementPage from './UsersManagementPage';
import { AdminRequiredAuth } from './components/AdminRequiredAuth';

export default function AdminRoutes() {
  return (
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
  );
}
