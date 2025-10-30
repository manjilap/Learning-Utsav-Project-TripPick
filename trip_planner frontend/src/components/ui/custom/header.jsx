import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function Header() {
  const [open, setOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const loc = useLocation()
  const navigate = useNavigate()
  const isActive = (p) => loc.pathname === p

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('access') || localStorage.getItem('jwt_token')
    setIsAuthenticated(!!token)
    
    // Get user info from localStorage (stored during login)
    const userInfo = localStorage.getItem('user_info')
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo)
        setUserName(parsed.full_name || parsed.email || 'User')
      } catch (e) {
        setUserName('User')
      }
    }
  }, [loc])

  useEffect(() => {
    // Close profile menu when clicking outside
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProfileMenu])

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('user_info')
    setIsAuthenticated(false)
    setUserName('')
    setShowProfileMenu(false)
    navigate('/signin')
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

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
          {isAuthenticated ? (
            <div className='relative profile-menu-container'>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className='flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 border border-gray-200'
              >
                <div className='w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold'>
                  {getInitials(userName)}
                </div>
                <span className='text-sm font-medium text-gray-700'>{userName}</span>
                <svg className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </button>
              
              {showProfileMenu && (
                <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1'>
                  <Link 
                    to='/history' 
                    onClick={() => setShowProfileMenu(false)}
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                  >
                    My Itineraries
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50'
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to='/signin' className='px-4 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50'>Sign In</Link>
              <Link to='/register' className='px-4 py-2 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700'>Register</Link>
            </>
          )}
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
              {isAuthenticated ? (
                <>
                  <div className='flex items-center gap-2 py-2'>
                    <div className='w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold'>
                      {getInitials(userName)}
                    </div>
                    <span className='text-sm font-medium text-gray-700'>{userName}</span>
                  </div>
                  <Link to='/history' onClick={() => setOpen(false)} className='block py-2 text-gray-700'>My Itineraries</Link>
                  <button 
                    onClick={() => { setOpen(false); handleLogout(); }}
                    className='w-full text-left py-2 text-red-600'
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to='/signin' onClick={() => setOpen(false)} className='block py-2 text-gray-700'>Sign In</Link>
                  <Link to='/register' onClick={() => setOpen(false)} className='block py-2 text-white bg-purple-600 rounded-md text-center mt-2'>Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header