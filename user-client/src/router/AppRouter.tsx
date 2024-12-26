import {Route, Routes} from "react-router-dom";
import LoginPage from "@/app/auth/Login.tsx";
import RegisterPage from "@/app/auth/Register.tsx";
import ResetPasswordPage from "@/app/auth/ResetPassword.tsx";
import {AuthLayout} from "@/layouts/AuthLayout.tsx";
import {MainLayout} from "@/layouts/MainLayout.tsx";
import HomePage from "@/app/HomePage/HomePage.tsx";

function AppRouter() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rs-pw" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
    </Routes>
  )
}
export default AppRouter;
