import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Header() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const isActive = (p) => loc.pathname === p

  return (
    <header className='sticky top-0 bg-white z-50 shadow-sm'>
      <div className='container mx-auto flex items-center justify-between p-4'>
        <div className='flex items-center gap-4'>
          <Link to='/' className='flex items-center gap-3'>
            <img src='/trippick_logo.svg' alt='TripPick' className='w-40 h-auto' />
          </Link>
          <nav className='hidden md:flex gap-6 ml-6'>
            <Link to='/' className={`text-sm ${isActive('/') ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}`}>Home</Link>
            <Link to='/createtrip' className={`text-sm ${isActive('/createtrip') ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}`}>Plan</Link>
            <Link to='/contact' className={`text-sm ${isActive('/contact') ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}`}>Contact</Link>
          </nav>
        </div>

        <div className='hidden md:flex items-center gap-3'>
          <Link to='/signin' className='px-4 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50'>Sign In</Link>
          <Link to='/register' className='px-4 py-2 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700'>Register</Link>
        </div>

        {/* Mobile */}
        <div className='md:hidden flex items-center'>
          <button onClick={() => setOpen(s => !s)} aria-label='Toggle menu' className='p-2 rounded-md border border-gray-200'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
              <path fillRule='evenodd' d={open ? 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' : 'M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 4a1 1 0 100-2h12a1 1 0 100 2H4z'} clipRule='evenodd' />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className='md:hidden border-t border-gray-100 bg-white'>
          <div className='container mx-auto p-4 space-y-3'>
            <Link to='/' onClick={() => setOpen(false)} className='block text-gray-700'>Home</Link>
            <Link to='/createtrip' onClick={() => setOpen(false)} className='block text-gray-700'>Plan</Link>
            <Link to='/contact' onClick={() => setOpen(false)} className='block text-gray-700'>Contact</Link>
            <div className='pt-2 border-t border-gray-100'>
              <Link to='/signin' onClick={() => setOpen(false)} className='block py-2 text-gray-700'>Sign In</Link>
              <Link to='/register' onClick={() => setOpen(false)} className='block py-2 text-white bg-purple-600 rounded-md text-center mt-2'>Register</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header