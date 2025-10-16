import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import CreateTrip from './create_trip/index.jsx'
import { createBrowserRouter, RouterProvider }  from 'react-router-dom'
import Header from './components/ui/custom/header.jsx'

const router=createBrowserRouter([
  {path:'/', element:<App/>}, 
  {path:'/createtrip', element:<CreateTrip/>}]
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Header/>
    <RouterProvider router={router}/>
  </StrictMode>,
)
