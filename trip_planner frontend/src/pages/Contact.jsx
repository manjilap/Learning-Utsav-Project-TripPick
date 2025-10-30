import React, { useState } from 'react'
import { Mail, MessageSquare, User, Send, MapPin, Phone } from 'lucide-react'

export default function Contact(){
  const [form, setForm] = useState({name:'', email:'', message:''})
  const [submitted, setSubmitted] = useState(false)
  
  const handleChange = (k) => (e) => setForm(f=>({ ...f, [k]: e.target.value}))
  
  const handleSubmit = (e) => { 
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-16'>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4'>
            Get in Touch
          </h1>
          <p className='text-xl text-gray-700'>We'd love to hear from you. Send us a message!</p>
        </div>

        <div className='grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12'>
          <div className='bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-purple-100'>
            <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4'>
              <Mail className='text-white' size={24} />
            </div>
            <h3 className='text-lg font-bold text-gray-800 mb-2'>Email Us</h3>
            <p className='text-gray-600 text-sm'>support@trippick.com</p>
          </div>

          <div className='bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-blue-100'>
            <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4'>
              <Phone className='text-white' size={24} />
            </div>
            <h3 className='text-lg font-bold text-gray-800 mb-2'>Call Us</h3>
            <p className='text-gray-600 text-sm'>+1 (555) 123-4567</p>
          </div>

          <div className='bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-pink-100'>
            <div className='w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4'>
              <MapPin className='text-white' size={24} />
            </div>
            <h3 className='text-lg font-bold text-gray-800 mb-2'>Visit Us</h3>
            <p className='text-gray-600 text-sm'>123 Travel St, Adventure City</p>
          </div>
        </div>

        <div className='max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-10 border-t-4 border-purple-600'>
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4'>
              <MessageSquare className='text-white' size={28} />
            </div>
            <h2 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2'>
              Send us a Message
            </h2>
            <p className='text-gray-600'>Fill out the form below and we'll get back to you soon</p>
          </div>

          {submitted && (
            <div className='mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 text-center font-medium'>
              ✓ Thank you! Your message has been sent successfully.
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                <User size={16} className='text-purple-600' />
                Your Name
              </label>
              <input 
                value={form.name} 
                onChange={handleChange('name')} 
                placeholder='John Doe'
                className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-600 focus:outline-none transition-colors'
                required
              />
            </div>

            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                <Mail size={16} className='text-purple-600' />
                Email Address
              </label>
              <input 
                value={form.email} 
                onChange={handleChange('email')} 
                type='email'
                placeholder='you@example.com'
                className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-600 focus:outline-none transition-colors'
                required
              />
            </div>

            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                <MessageSquare size={16} className='text-purple-600' />
                Your Message
              </label>
              <textarea 
                value={form.message} 
                onChange={handleChange('message')} 
                placeholder='Tell us how we can help you...'
                className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-600 focus:outline-none transition-colors resize-none h-40'
                required
              />
            </div>

            <button 
              type='submit'
              className='w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
            >
              <Send size={20} />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
