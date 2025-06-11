import { Route, Routes } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import AdminDashboardPage from './AdminDashboardPage';
import ContentApprovalPage from './ContentApprovalPage';
import UsersManagementPage from './UsersManagementPage';
import CategoryManagementPage from './CategoryManagementPage';
import RegionManagementPage from './RegionManagementPage';
import { AdminRequiredAuth } from './components/AdminRequiredAuth';
import { AdminRoleMonitor } from './components/AdminRoleMonitor';
import { AdminDashboardLayout } from './layouts/AdminDashboardLayout';

// Admin Layout Component để tránh re-render sidebar
const AdminLayout = () => (
  <AdminDashboardLayout>
    <Outlet />
  </AdminDashboardLayout>
);

export default function AdminRoutes() {
  return (
    <>
      {/* Giám sát thay đổi vai trò admin và chuyển hướng nếu mất quyền truy cập */}
      <AdminRoleMonitor />
      
      <Routes>        <Route element={<AdminRequiredAuth />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<AdminDashboardPage />} />
            <Route path="/approval" element={<ContentApprovalPage />} />
            <Route path="/users" element={<UsersManagementPage />} />
            <Route path="/parameters/categories" element={<CategoryManagementPage />} />
            <Route path="/parameters/regions" element={<RegionManagementPage />} />
            <Route path="/events" element={<div>Trang Quản lý Sự kiện (Sắp ra mắt)</div>} />
            <Route path="/analytics" element={<div>Trang Phân tích (Sắp ra mắt)</div>} />
            <Route path="/reports" element={<div>Trang Báo cáo (Sắp ra mắt)</div>} />
            <Route path="/settings" element={<div>Trang Cài đặt Admin (Sắp ra mắt)</div>} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
