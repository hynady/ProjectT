import Navbar from "@/commons/blocks/Navbar.tsx";
import {Outlet} from "react-router-dom";
import Footer from "@/commons/blocks/footer.tsx";

export const NavLayout = () => {
  return (
    <main>
      <Navbar/>
      <Outlet/>
      <Footer/>
    </main>
  )
}