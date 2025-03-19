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
import AdminPage from "@/features/admin/block/AdminPage.tsx";
import ProtectedBookingRoute from "@/router/ProtectedBookingRoute";
import OrganizePage from "@/features/organize/OrganizePage.tsx";
import CreateOccaPage from "@/features/organize/CreateOccaPage.tsx";
import PreviewOccaDetail from "@/features/organize/components/preview/PreviewOccaDetail";

function AppRouter() {
  return (
    <ScrollToTop>
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
          </Route>
          <Route element={<HomeLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="my-ticket" element={<MyTicketsPage />} />
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

        {/* Organize Routes - Protected - WITHOUT NavLayout */}
        <Route path="/organize">
          <Route index element={<ProtectedRoute><OrganizePage /></ProtectedRoute>} />
          <Route path="create" element={<ProtectedRoute><CreateOccaPage /></ProtectedRoute>} />
          <Route path="edit/:id" element={<ProtectedRoute><CreateOccaPage /></ProtectedRoute>} />
          <Route path="events" element={<ProtectedRoute><OrganizePage /></ProtectedRoute>} />
          <Route path="tickets" element={<ProtectedRoute><OrganizePage /></ProtectedRoute>} />
          <Route path="customers" element={<ProtectedRoute><OrganizePage /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><OrganizePage /></ProtectedRoute>} />
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
        <Route path="/test" element={<AdminPage />} />
      </Routes>
    </ScrollToTop>
  );
}

export default AppRouter;
