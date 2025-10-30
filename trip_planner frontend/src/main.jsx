import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import CreateTrip from './create_trip/index.jsx'
import Contact from './pages/Contact.jsx'
import Homepage from './pages/Homepage.jsx'
import SignIn from './pages/SignIn.jsx'
import Register from './pages/Register.jsx'
import ItineraryResult from './itinerary/itineraryresult.jsx'
import { createBrowserRouter, RouterProvider, Outlet }  from 'react-router-dom'
import Header from './components/ui/custom/header.jsx'

function RootLayout(){
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
  { index: true, element: <Homepage /> },
  { path: 'createtrip', element: <CreateTrip /> },
  { path: 'itinerary', element: <ItineraryResult /> },
      { path: 'contact', element: <Contact /> },
      { path: 'signin', element: <SignIn /> },
      { path: 'register', element: <Register /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
