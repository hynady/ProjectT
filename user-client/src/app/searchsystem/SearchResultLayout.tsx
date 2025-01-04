import {Outlet} from 'react-router-dom'

export const SearchResultLayout = () => {
  return (
    <main className="container mx-auto px-4 py-20">
      <Outlet/>
    </main>
  )
}