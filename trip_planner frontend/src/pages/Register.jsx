import React, { useState } from 'react'
import { UserPlus, Mail, Lock, User } from 'lucide-react'
import api from '@/service/api'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [vals, setVals] = useState({email:'', password:'', firstname:'', lastname:''})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const change = k => e => setVals(v=>({ ...v, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // backend serializer expects first_name, last_name, password and password2
      const payload = {
        first_name: vals.firstname || '',
        last_name: vals.lastname || '',
        email: vals.email,
        password: vals.password,
        password2: vals.password,
      }
      const resp = await api.post('/api/accounts/register/', payload)
      // on success, navigate to sign in and show a message (server emails verification)
      navigate('/signin', { state: { registered: true } })
    } catch (err) {
      console.error('Register error', err)
      setError(err.response?.data?.message || err.response?.data || err.message || 'Registration failed')
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
              <UserPlus className='text-white' size={28} />
            </div>
            <h2 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2'>Create Account</h2>
            <p className='text-gray-600'>Join Trip Pick to save and manage your itineraries</p>
          </div>

          <form onSubmit={submit} className='space-y-5'>
            {error && (
              <div className='text-red-700 bg-red-50 p-4 rounded-xl border border-red-200'>
                {typeof error === 'object' ? JSON.stringify(error) : error}
              </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  <User size={16} className='text-purple-600' />
                  First Name
                </label>
                <input 
                  value={vals.firstname} 
                  onChange={change('firstname')} 
                  placeholder='John' 
                  className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-600 focus:outline-none transition-colors'
                  required
                />
              </div>

              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  <User size={16} className='text-purple-600' />
                  Last Name
                </label>
                <input 
                  value={vals.lastname} 
                  onChange={change('lastname')} 
                  placeholder='Doe' 
                  className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-600 focus:outline-none transition-colors'
                  required
                />
              </div>
            </div>

            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                <Mail size={16} className='text-purple-600' />
                Email Address
              </label>
              <input 
                value={vals.email} 
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
                value={vals.password} 
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
              {loading ? '⏳ Creating...' : 'Create Account'}
            </button>

            <div className='text-center pt-4 border-t border-gray-200'>
              <p className='text-gray-600'>
                Already have an account?{' '}
                <a href='/signin' className='text-purple-600 font-semibold hover:text-purple-700'>
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
