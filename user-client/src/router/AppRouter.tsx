import { Route, Routes } from "react-router-dom";
import HomePage from "@/features/home/HomePage.tsx";
import SettingsProfilePage from "@/features/setting/blocks/SettingsProfilePage.tsx";
import SettingsAccountPage from "@/features/setting/blocks/SettingsAccountPage.tsx";
import { SearchPage } from "@/features/search/blocks/SearchPage.tsx";
import { NavLayout } from "@/commons/layouts/NavLayout.tsx";
import AuthRoute from "@/router/AuthRoute.tsx";
import { ProtectedRoute } from "@/router/ProtectedRoute.tsx";
import NotFoundPage from "@/commons/blocks/NotFoundPage.tsx";
import EventDetailPage from "@/features/detail/OccaDetail.tsx";
import { ScrollToTop } from "@/commons/blocks/ScrollToTop.tsx";
import BookingPage from "@/features/booking/BookingPage.tsx";
import { MyTicketsPage } from "@/features/my-ticket/MyTicketsPage.tsx";
import { AuthLayout } from "@/features/auth/layout.tsx";
import LoginPage from "@/features/auth/blocks/LoginForm.tsx";
import { HomeLayout } from "@/features/home/layout.tsx";
import { SearchResultLayout } from "@/features/search/layout.tsx";
import { DetailPageLayout } from "@/features/detail/layout.tsx";
import SettingsLayout from "@/features/setting/layout.tsx";
import { ResetPassword } from "@/features/auth/blocks/ResetPasswordForm.tsx";
import { RegisterForm } from "@/features/auth/blocks/RegisterForm.tsx";
import ProtectedBookingRoute from "@/router/ProtectedBookingRoute.tsx";
import OrganizePage from "@/features/organize/OrganizePage.tsx";
import CreateOccaPage from "@/features/organize/CreateOccaPage.tsx";
import PreviewOccaDetail from "@/features/organize/components/preview/PreviewOccaDetail";
import EditOccaPage from "@/features/organize/EditOccaPage";
import AdminRoutes from "@/features/admin/AdminRoutes";
import { TrackingProvider } from "@/features/tracking/contexts/TrackingContext";
import OrganizeAnalyticsPage from "@/features/organize/pages/OrganizeAnalyticsPage";
import TicketManagementPage from "@/features/organize/pages/TicketManagementPage";
import ShowAuthPage from "@/features/ticket-check-in/ShowAuthPage";
import TicketScanPage from "@/features/ticket-check-in/TicketScanPage";
import TicketListPage from "@/features/ticket-check-in/TicketListPage";
import { DashboardLayout } from "@/features/organize/layouts/DashboardLayout";
import { Outlet } from "react-router-dom";
import ChatbotPage from "@/features/chatbot/pages/ChatbotPage";

// Organize Layout Component to prevent sidebar re-render
const OrganizeLayout = () => (
  <ProtectedRoute>
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  </ProtectedRoute>
);

function AppRouter() {
  return (
    <ScrollToTop>
      <TrackingProvider>
        <Routes>
          {/* Nav Routes */}
          <Route element={<NavLayout />}>
            <Route element={<SearchResultLayout />}>
              <Route path="/search" element={<SearchPage />} />
            </Route>
            <Route path="occas" element={<DetailPageLayout />}>
              <Route path=":id" element={<EventDetailPage />} />
              <Route
                path=":id/booking"
                element={
                  <ProtectedBookingRoute>
                    <BookingPage />
                  </ProtectedBookingRoute>
                }
              />
            </Route>{" "}
            <Route element={<HomeLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="my-ticket" element={<MyTicketsPage />} />
              <Route
                path="chatbot"
                element={
                  <ProtectedRoute>
                    <ChatbotPage />
                  </ProtectedRoute>
                }
              />
            </Route>
            {/* Settings Routes - Protected */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsLayout />
                </ProtectedRoute>
              }
            >
              <Route path="profile" element={<SettingsProfilePage />} />
              <Route path="account" element={<SettingsAccountPage />} />
            </Route>
          </Route>

          {/* Organize Routes - Protected - WITH shared DashboardLayout */}
          <Route path="/organize" element={<OrganizeLayout />}>
            <Route index element={<OrganizePage />} />
            <Route path="create" element={<CreateOccaPage />} />
            <Route path="edit/:id" element={<EditOccaPage />} />
            <Route path="events" element={<OrganizePage />} />
            <Route path="analytics" element={<OrganizeAnalyticsPage />} />
            <Route
              path="tickets/:occaId/:showId"
              element={<TicketManagementPage />}
            />
          </Route>

          {/* Admin Routes - Protected - WITHOUT NavLayout */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Ticket Check-in Routes - No Auth Required */}
          <Route path="/ticket-check-in">
            <Route index element={<ShowAuthPage />} />
            <Route path="scan" element={<TicketScanPage />} />
            <Route path="tickets" element={<TicketListPage />} />
          </Route>

          {/* Preview Routes */}
          <Route path="/preview/occa" element={<PreviewOccaDetail />} />

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={
                <AuthRoute>
                  <LoginPage />
                </AuthRoute>
              }
            />
            <Route
              path="/register"
              element={
                <AuthRoute>
                  <RegisterForm />
                </AuthRoute>
              }
            />
            <Route
              path="/rs-pw"
              element={
                <AuthRoute>
                  <ResetPassword />
                </AuthRoute>
              }
            />
          </Route>

          {/* 404 Not Found Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </TrackingProvider>
    </ScrollToTop>
  );
}

export default AppRouter;
