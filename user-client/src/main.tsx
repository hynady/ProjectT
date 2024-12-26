import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {BrowserRouter} from "react-router-dom";
import AppRouter from "@/router/AppRouter.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";
import {ThemeProvider} from "@/components/theme-provider.tsx";
import {AppProvider} from "@/components/AppContext.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrowserRouter>
          <AppRouter/>
          <Toaster/>
        </BrowserRouter>
      </ThemeProvider>
    </AppProvider>
  </StrictMode>,
);