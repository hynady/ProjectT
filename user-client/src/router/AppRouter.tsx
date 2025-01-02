import { Route, Routes } from "react-router-dom";
import LoginPage from "@/app/authpage/components/Login.tsx";
import RegisterPage from "@/app/authpage/components/Register.tsx";
import ResetPasswordPage from "@/app/authpage/components/ResetPassword.tsx";
import { AuthLayout } from "@/app/authpage/AuthLayout.tsx";
import { HomeLayout } from "@/app/homepage/HomeLayout.tsx";
import HomePage from "@/app/homepage/components/HomePage.tsx";
import ProtectedRoute from "@/router/ProtectedRoute.tsx";
import {CardWithForm} from "@/app/authpage/components/Test.tsx";
import SettingsProfilePage from "@/app/settingspage/components/SettingsProfilePage.tsx";
import SettingsLayout from "@/app/settingspage/SettingsLayout.tsx";
import SettingsAccountPage from "@/app/settingspage/components/SettingsAccountPage.tsx";

function AppRouter() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rs-pw" element={<ResetPasswordPage />} />
        <Route path="/t" element={<CardWithForm/>} />
      </Route>
      {/* Protected Main Routes */}
      <Route element={<HomeLayout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/settings" element={<SettingsLayout />}>
        <Route path="profile" element={<SettingsProfilePage />} />
        <Route path="account" element={<SettingsAccountPage />} />
        {/* Thêm các route khác tương tự */}
      </Route>
    </Routes>
  );
}

export default AppRouter;
