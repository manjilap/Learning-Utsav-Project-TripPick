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
    <header className='sticky top-0 bg-white/95 backdrop-blur-sm z-50 shadow-md border-b-2 border-purple-100'>
      <div className='container mx-auto flex items-center justify-between px-6 py-4'>
        <div className='flex items-center gap-6'>
          <Link to='/' className='flex items-center gap-3 group'>
            <div className='w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200'>
              <span className='text-white font-bold text-xl'>T</span>
            </div>
            <span className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
              TripPick
            </span>
          </Link>
          <nav className='hidden md:flex gap-1 ml-6'>
            <Link 
              to='/' 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/') 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to='/createtrip' 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/createtrip') 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              Plan Trip
            </Link>
            <Link 
              to='/contact' 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/contact') 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              Contact
            </Link>
          </nav>
        </div>

        <div className='hidden md:flex items-center gap-3'>
          {isAuthenticated ? (
            <div className='relative profile-menu-container'>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className='flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-purple-50 border-2 border-purple-200 transition-all duration-200 hover:border-purple-400'
              >
                <div className='w-9 h-9 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md'>
                  {getInitials(userName)}
                </div>
                <span className='text-sm font-semibold text-gray-700'>{userName}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </button>
              
              {showProfileMenu && (
                <div className='absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-purple-100 py-2 overflow-hidden'>
                  <Link 
                    to='/history' 
                    onClick={() => setShowProfileMenu(false)}
                    className='flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                    </svg>
                    My Itineraries
                  </Link>
                  <div className='border-t border-gray-100 my-1'></div>
                  <button 
                    onClick={handleLogout}
                    className='w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link 
                to='/signin' 
                className='px-5 py-2.5 text-sm font-medium rounded-xl border-2 border-purple-200 text-purple-600 hover:bg-purple-50 transition-all duration-200'
              >
                Sign In
              </Link>
              <Link 
                to='/register' 
                className='px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className='md:hidden flex items-center'>
          <button onClick={() => setOpen(s => !s)} aria-label='Toggle menu' className='p-2 rounded-lg border-2 border-purple-200 hover:bg-purple-50 transition-colors'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-purple-600' viewBox='0 0 20 20' fill='currentColor'>
              <path fillRule='evenodd' d={open ? 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' : 'M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 4a1 1 0 100-2h12a1 1 0 100 2H4z'} clipRule='evenodd' />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className='md:hidden border-t-2 border-purple-100 bg-white/95 backdrop-blur-sm shadow-lg'>
          <div className='container mx-auto p-4 space-y-2'>
            <Link to='/' onClick={() => setOpen(false)} className='block px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors'>
              Home
            </Link>
            <Link to='/createtrip' onClick={() => setOpen(false)} className='block px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors'>
              Plan Trip
            </Link>
            <Link to='/contact' onClick={() => setOpen(false)} className='block px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors'>
              Contact
            </Link>
            <div className='pt-2 border-t-2 border-purple-100 mt-2'>
              {isAuthenticated ? (
                <>
                  <div className='flex items-center gap-3 px-4 py-3 bg-purple-50 rounded-lg mb-2'>
                    <div className='w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md'>
                      {getInitials(userName)}
                    </div>
                    <span className='text-sm font-semibold text-gray-700'>{userName}</span>
                  </div>
                  <Link to='/history' onClick={() => setOpen(false)} className='block px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors'>
                    My Itineraries
                  </Link>
                  <button 
                    onClick={() => { setOpen(false); handleLogout(); }}
                    className='w-full text-left px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors'
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to='/signin' onClick={() => setOpen(false)} className='block px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors mb-2'>
                    Sign In
                  </Link>
                  <Link to='/register' onClick={() => setOpen(false)} className='block px-6 py-3 text-white font-semibold bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-center shadow-lg'>
                    Register
                  </Link>
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