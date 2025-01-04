import Navbar from "@/components/global/Navbar.tsx";
import {Outlet} from "react-router-dom";

export const NavLayout = () => {
  return (
    <main className="">
      <Navbar/>
      <Outlet/>
    </main>
  )
}