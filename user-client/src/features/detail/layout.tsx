import {Outlet} from 'react-router-dom'

export const DetailPageLayout = () => {
  return (
    <main className="mx-auto py-10 ">
      <Outlet/>
    </main>
  )
}