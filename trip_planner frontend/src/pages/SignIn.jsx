import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LogIn, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import api from '@/service/api'

export default function SignIn(){
  const [creds, setCreds] = useState({email:'', password:''})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Check for verification status in URL params
    const verified = searchParams.get('verified')
    if (verified === 'true') {
      setSuccessMsg('Email verified successfully! You can now sign in.')
    } else if (verified === 'already') {
      setSuccessMsg('Email already verified. Please sign in.')
    } else if (verified === 'false') {
      setError('Invalid verification link. Please try again or contact support.')
    }
  }, [searchParams])

  const change = k => e => setCreds(c=>({ ...c, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const resp = await api.post('/api/accounts/login/', creds)
      const data = resp.data
      // backend returns access_token and refresh_token from serializer
      const access = data?.access_token || data?.access
      const refresh = data?.refresh_token || data?.refresh
      if (access) localStorage.setItem('access', access)
      if (refresh) localStorage.setItem('refresh', refresh)
      // optional: store a convenience jwt_token key for older code
      if (access && !localStorage.getItem('jwt_token')) localStorage.setItem('jwt_token', access)
      
      // Store user info for header display
      const userInfo = {
        email: data?.email,
        full_name: data?.full_name
      }
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      
      navigate('/')
    } catch (err) {
      console.error('Login error', err)
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center py-16'>
      <div className='container mx-auto px-6'>
        <div className='max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-10 border-t-4 border-purple-600'>
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4'>
              <LogIn className='text-white' size={28} />
            </div>
            <h2 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2'>Welcome Back</h2>
            <p className='text-gray-600'>Sign in to access your saved itineraries</p>
          </div>

          <form onSubmit={submit} className='space-y-5'>
            {successMsg && (
              <div className='flex items-start gap-3 text-green-700 bg-green-50 p-4 rounded-xl border border-green-200'>
                <CheckCircle size={20} className='flex-shrink-0 mt-0.5' />
                <span>{successMsg}</span>
              </div>
            )}
            {error && (
              <div className='flex items-start gap-3 text-red-700 bg-red-50 p-4 rounded-xl border border-red-200'>
                <AlertCircle size={20} className='flex-shrink-0 mt-0.5' />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                <Mail size={16} className='text-purple-600' />
                Email Address
              </label>
              <input 
                value={creds.email} 
                onChange={change('email')} 
                type='email'
                placeholder='you@example.com' 
                className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-600 focus:outline-none transition-colors'
                required
              />
            </div>

            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                <Lock size={16} className='text-purple-600' />
                Password
              </label>
              <input 
                value={creds.password} 
                onChange={change('password')} 
                type='password' 
                placeholder='••••••••' 
                className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-600 focus:outline-none transition-colors'
                required
              />
            </div>

            <button 
              type='submit'
              disabled={loading} 
              className='w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
            >
              {loading ? '⏳ Signing in...' : 'Sign In'}
            </button>

            <div className='text-center pt-4 border-t border-gray-200'>
              <p className='text-gray-600'>
                Don't have an account?{' '}
                <Link to='/register' className='text-purple-600 font-semibold hover:text-purple-700'>
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
