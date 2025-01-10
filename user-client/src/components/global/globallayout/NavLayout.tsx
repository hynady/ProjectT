import Navbar from "@/components/global/Navbar.tsx";
import {Outlet} from "react-router-dom";
import Footer from "@/components/global/footer.tsx";

export const NavLayout = () => {
  return (
    <main>
      <Navbar/>
      <Outlet/>
      <Footer/>

    </main>
  )
}