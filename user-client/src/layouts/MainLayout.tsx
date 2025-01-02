// layouts/MainLayout.tsx
import {Outlet} from 'react-router-dom'
import Navbar from "@/components/Navbar.tsx";

export const MainLayout = () => {
  return (
    <main className="container mx-auto px-4 py-20">
      <Navbar/>
      <Outlet/>
    </main>
  )
}