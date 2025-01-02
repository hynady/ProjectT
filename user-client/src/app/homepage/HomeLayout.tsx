// layouts/MainLayout.tsx
import {Outlet} from 'react-router-dom'
import Navbar from "@/components/global/Navbar.tsx";

export const HomeLayout = () => {
  return (
    <main className="container mx-auto px-4 py-20">
      <Navbar/>
      <Outlet/>
    </main>
  )
}