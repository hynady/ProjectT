import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {BrowserRouter} from "react-router-dom";
import AppRouter from "@/router/AppRouter.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";
import {ThemeProvider} from "@/components/global/theme-provider.tsx";
import {AuthProvider} from "@/app/authpage/contexts/AuthContext.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="hide-scrollbar">
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <BrowserRouter>
            <AppRouter/>
            <Toaster/>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </div>
  </StrictMode>,
);