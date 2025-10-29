import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function SignIn(){
  const [creds, setCreds] = useState({email:'', password:''})
  const change = k => e => setCreds(c=>({ ...c, [k]: e.target.value }))
  const submit = e => { e.preventDefault(); alert('Dummy sign in - not wired') }
  return (
    <div className='min-h-[60vh] flex items-center py-16'>
      <div className='container mx-auto px-6'>
        <div className='max-w-md mx-auto bg-white rounded-xl shadow-md p-8'>
          <h2 className='text-2xl font-bold mb-4'>Sign In</h2>
          <p className='text-sm text-gray-500 mb-4'>Sign in to access saved itineraries and preferences.</p>
          <form onSubmit={submit} className='space-y-4'>
            <input value={creds.email} onChange={change('email')} placeholder='Email' className='w-full border rounded px-3 py-2' />
            <input value={creds.password} onChange={change('password')} type='password' placeholder='Password' className='w-full border rounded px-3 py-2' />
            <div className='flex items-center justify-between'>
              <button className='px-4 py-2 bg-purple-600 text-white rounded'>Sign In</button>
              <Link to='/register' className='text-sm text-purple-600'>Create account</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
