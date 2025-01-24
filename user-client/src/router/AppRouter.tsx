import {Route, Routes} from "react-router-dom";
import HomePage from "@/features/home/HomePage.tsx";
import SettingsProfilePage from "@/features/setting/blocks/SettingsProfilePage.tsx";
import SettingsAccountPage from "@/features/setting/blocks/SettingsAccountPage.tsx";
import {SearchPage} from "@/features/search/blocks/SearchPage.tsx";
import {NavLayout} from "@/commons/layouts/NavLayout.tsx";
import AuthRoute from "@/router/AuthRoute.tsx";
import {ProtectedRoute} from "@/router/ProtectedRoute.tsx";
import NotFoundPage from "@/commons/blocks/NotFoundPage.tsx";
import EventDetailPage from "@/features/detail/OccaDetail.tsx";
import {ScrollToTop} from "@/commons/blocks/ScrollToTop.tsx";
import BookingPage from "@/features/booking/BookingPage.tsx";
import {MyTicketsPage} from "@/features/my-ticket/MyTicketsPage.tsx";
import {AuthLayout} from "@/features/auth/layout.tsx";
import LoginPage from "@/features/auth/blocks/LoginForm.tsx";
import RegisterPage from "@/features/auth/blocks/RegisterForm.tsx";
import ResetPassword from "@/features/auth/blocks/ResetPasswordForm.tsx";
import {HomeLayout} from "@/features/home/layout.tsx";
import {SearchResultLayout} from "@/features/search/layout.tsx";
import {DetailPageLayout} from "@/features/detail/layout.tsx";
import SettingsLayout from "@/features/setting/layout.tsx";

function AppRouter() {
  return (
    <ScrollToTop>
      <Routes>
        {/* Nav Routes */}
        <Route element={<NavLayout/>}>
          <Route element={<SearchResultLayout/>}>
            <Route path="/search" element={<SearchPage/>}/>
          </Route>
          <Route path="occas" element={<DetailPageLayout/>}>
            <Route path=":id" element={<EventDetailPage/>}/>
            <Route path=":id/booking" element={<BookingPage/>}/>
          </Route>
          <Route element={<HomeLayout/>}>
            <Route path="/" element={<HomePage/>}/>
            <Route path="my-ticket" element={<MyTicketsPage/>}/>
          </Route>

          {/* Settings Routes - Protected */}
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsLayout/>
            </ProtectedRoute>
          }>
            <Route path="profile" element={<SettingsProfilePage/>}/>
            <Route path="account" element={<SettingsAccountPage/>}/>
          </Route>
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout/>}>
          <Route path="/login" element={<AuthRoute><LoginPage/></AuthRoute>}/>
          <Route path="/register" element={<AuthRoute><RegisterPage/></AuthRoute>}/>
          <Route path="/rs-pw" element={<AuthRoute><ResetPassword/></AuthRoute>}/>
        </Route>

        {/* 404 Not Found Route */}
        <Route path="*" element={<NotFoundPage/>}/>
      </Routes>
    </ScrollToTop>

  );
}

export default AppRouter;
