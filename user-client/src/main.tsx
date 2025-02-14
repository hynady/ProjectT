import {createRoot} from 'react-dom/client'
import './index.css'
import {BrowserRouter} from "react-router-dom";
import AppRouter from "@/router/AppRouter.tsx";
import {Toaster} from "@/commons/components/toaster.tsx";
import {ThemeProvider} from "@/commons/blocks/theme-provider.tsx";
import {AuthProvider} from "@/features/auth/contexts.tsx";
import DevToolbar from "@/commons/blocks/DevToolbar.tsx";

createRoot(document.getElementById('root')!).render(
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter/>
          <Toaster/>
        </AuthProvider>
        <DevToolbar />
      </BrowserRouter>
    </ThemeProvider>
);