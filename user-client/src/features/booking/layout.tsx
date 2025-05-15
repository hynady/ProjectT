import { Outlet } from "react-router-dom"

export const BookingLayout = () => {
  return (
    <main className="container px-4">
      <Outlet/>
    </main>
  )
}