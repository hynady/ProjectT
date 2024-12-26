import {Outlet} from 'react-router-dom'
import {ModeToggle} from "@/components/ui/mode-toggle.tsx";

export const AuthLayout = () => {
  return (
    <>
      <Outlet/>
      <div className="fixed bottom-14 right-14">
        <ModeToggle/>
      </div>
    </>
  )
}
