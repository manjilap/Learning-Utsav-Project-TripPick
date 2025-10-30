import React, { useState } from 'react'
import api from '@/service/api'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [vals, setVals] = useState({email:'', password:'', name:''})
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
    <div className='min-h-[60vh] flex items-center py-16'>
      <div className='container mx-auto px-6'>
        <div className='max-w-md mx-auto bg-white rounded-xl shadow-md p-8'>
          <h2 className='text-2xl font-bold mb-4'>Create an account</h2>
          <p className='text-sm text-gray-500 mb-4'>Create an account to save itineraries and access them across devices.</p>
          <form onSubmit={submit} className='space-y-4'>
            {error && <div className='text-red-600'>{error}</div>}
            <input value={vals.firstname} onChange={change('firstname')} placeholder='First Name' className='w-full border rounded px-3 py-2' />
            <input value={vals.lastname} onChange={change('lastname')} placeholder='LastName' className='w-full border rounded px-3 py-2' />

            <input value={vals.email} onChange={change('email')} placeholder='Email' className='w-full border rounded px-3 py-2' />
            <input value={vals.password} onChange={change('password')} type='password' placeholder='Password' className='w-full border rounded px-3 py-2' />
            <div>
              <button disabled={loading} className='px-4 py-2 bg-purple-600 text-white rounded'>{loading ? 'Creating...' : 'Register'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
