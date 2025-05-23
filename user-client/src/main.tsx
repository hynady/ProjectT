import {createRoot} from 'react-dom/client'
import './index.css'
import {BrowserRouter} from "react-router-dom";
import AppRouter from "@/router/AppRouter.tsx";
import {Toaster} from "@/commons/components/toaster.tsx";
import {ThemeProvider} from "@/commons/blocks/theme-provider.tsx";
import {AuthProvider} from "@/features/auth/contexts.tsx";
import {UserProvider} from "@/features/auth/contexts/UserContext.tsx";
import DevToolbar from "@/commons/blocks/DevToolbar.tsx";
import { AdminRoleMonitor } from '@/features/admin/components/AdminRoleMonitor';

createRoot(document.getElementById('root')!).render(
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <AppRouter/>
            <Toaster/>
            {/* Global admin role monitor to check for role changes */}
            <AdminRoleMonitor />
          </UserProvider>
        </AuthProvider>
        <DevToolbar />
      </BrowserRouter>
    </ThemeProvider>
);