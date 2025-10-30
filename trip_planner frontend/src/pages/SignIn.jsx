import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
    <div className='min-h-[60vh] flex items-center py-16'>
      <div className='container mx-auto px-6'>
        <div className='max-w-md mx-auto bg-white rounded-xl shadow-md p-8'>
          <h2 className='text-2xl font-bold mb-4'>Sign In</h2>
          <p className='text-sm text-gray-500 mb-4'>Sign in to access saved itineraries and preferences.</p>
          <form onSubmit={submit} className='space-y-4'>
            {successMsg && <div className='text-green-600 bg-green-50 p-3 rounded border border-green-200'>{successMsg}</div>}
            {error && <div className='text-red-600 bg-red-50 p-3 rounded border border-red-200'>{error}</div>}
            <input value={creds.email} onChange={change('email')} placeholder='Email' className='w-full border rounded px-3 py-2' />
            <input value={creds.password} onChange={change('password')} type='password' placeholder='Password' className='w-full border rounded px-3 py-2' />
            <div className='flex items-center justify-between'>
              <button disabled={loading} className='px-4 py-2 bg-purple-600 text-white rounded'>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <Link to='/register' className='text-sm text-purple-600'>Create account</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
