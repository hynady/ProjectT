import {Outlet} from 'react-router-dom'

export const HomeLayout = () => {
  return (
    <main className="container mx-auto px-4 py-20 animate-fade-down animate-ease-in-out">
      <Outlet/>
    </main>
  )
}