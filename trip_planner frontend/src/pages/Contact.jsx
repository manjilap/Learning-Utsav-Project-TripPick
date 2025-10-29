import React, { useState } from 'react'

export default function Contact(){
  const [form, setForm] = useState({name:'', email:'', message:''})
  const handleChange = (k) => (e) => setForm(f=>({ ...f, [k]: e.target.value}))
  const handleSubmit = (e) => { e.preventDefault(); alert('Thanks! This is a dummy contact form.') }

  return (
    <div className='min-h-[60vh] flex items-center py-16'>
      <div className='container mx-auto px-6'>
        <div className='max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8'>
          <h2 className='text-2xl font-bold mb-2'>Contact Us</h2>
          <p className='text-gray-600 mb-6'>Have questions? Send us a message and we'll get back to you.</p>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <label className='block'>
              <span className='text-sm text-gray-700'>Name</span>
              <input value={form.name} onChange={handleChange('name')} className='mt-1 block w-full border rounded px-3 py-2' />
            </label>
            <label className='block'>
              <span className='text-sm text-gray-700'>Email</span>
              <input value={form.email} onChange={handleChange('email')} className='mt-1 block w-full border rounded px-3 py-2' />
            </label>
            <label className='block'>
              <span className='text-sm text-gray-700'>Message</span>
              <textarea value={form.message} onChange={handleChange('message')} className='mt-1 block w-full border rounded px-3 py-2 h-40' />
            </label>
            <div className='flex justify-end'>
              <button className='px-5 py-2 bg-purple-600 text-white rounded'>Send Message</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
