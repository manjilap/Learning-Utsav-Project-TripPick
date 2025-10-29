import React, { useState } from 'react'

export default function Register(){
  const [vals, setVals] = useState({email:'', password:'', name:''})
  const change = k => e => setVals(v=>({ ...v, [k]: e.target.value }))
  const submit = e => { e.preventDefault(); alert('Dummy register - not wired') }
  return (
    <div className='min-h-[60vh] flex items-center py-16'>
      <div className='container mx-auto px-6'>
        <div className='max-w-md mx-auto bg-white rounded-xl shadow-md p-8'>
          <h2 className='text-2xl font-bold mb-4'>Create an account</h2>
          <p className='text-sm text-gray-500 mb-4'>Create an account to save itineraries and access them across devices.</p>
          <form onSubmit={submit} className='space-y-4'>
            <input value={vals.name} onChange={change('name')} placeholder='Full name' className='w-full border rounded px-3 py-2' />
            <input value={vals.email} onChange={change('email')} placeholder='Email' className='w-full border rounded px-3 py-2' />
            <input value={vals.password} onChange={change('password')} type='password' placeholder='Password' className='w-full border rounded px-3 py-2' />
            <div>
              <button className='px-4 py-2 bg-purple-600 text-white rounded'>Register</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
