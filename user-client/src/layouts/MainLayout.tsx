// layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom'
import {ModeToggle} from "@/components/ui/mode-toggle.tsx";

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <div className="sticky-bottom">
        <ModeToggle />
      </div>
    </div>
  )
}