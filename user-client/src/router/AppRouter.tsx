import {Route, Routes} from "react-router-dom";
import LoginPage from "@/app/authpage/components/Login.tsx";
import RegisterPage from "@/app/authpage/components/Register.tsx";
import ResetPasswordPage from "@/app/authpage/components/ResetPassword.tsx";
import {AuthLayout} from "@/app/authpage/AuthLayout.tsx";
import {HomeLayout} from "@/app/homepage/HomeLayout.tsx";
import HomePage from "@/app/homepage/components/HomePage.tsx";
import SettingsProfilePage from "@/app/settingspage/components/SettingsProfilePage.tsx";
import SettingsLayout from "@/app/settingspage/SettingsLayout.tsx";
import SettingsAccountPage from "@/app/settingspage/components/SettingsAccountPage.tsx";
import {SearchResultLayout} from "@/app/searchsystem/SearchResultLayout.tsx";
import {SearchPage} from "@/app/searchsystem/components/SearchPage.tsx";
import {NavLayout} from "@/components/global/globallayout/NavLayout.tsx";
import AuthRoute from "@/router/AuthRoute.tsx";
import {ProtectedRoute} from "@/router/ProtectedRoute.tsx";
import NotFoundPage from "@/components/global/NotFoundPage.tsx";
import EventDetailPage from "@/app/detailpage/components/OccaDetail.tsx";
import {DetailPageLayout} from "@/app/detailpage/DetailPageLayout.tsx";
import {ScrollToTop} from "@/components/global/ScrollToTop.tsx";
import BookingPage from "@/app/bookingpage/components/BookingPage.tsx";

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
          <Route path="/rs-pw" element={<AuthRoute><ResetPasswordPage/></AuthRoute>}/>
        </Route>

        {/* 404 Not Found Route */}
        <Route path="*" element={<NotFoundPage/>}/>
      </Routes>
    </ScrollToTop>

  );
}

export default AppRouter;
