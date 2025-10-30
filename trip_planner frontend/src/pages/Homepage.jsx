import React from 'react'
import { Link } from 'react-router-dom'
import tourist from '@/assets/tourist.jpg'

export default function Homepage(){
  return (
    <main className='min-h-screen bg-gradient-to-b from-white via-purple-50 to-white'>
      <section className='container mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-10'>
        <div className='flex-1'>
          <h1 className='text-4xl md:text-5xl font-extrabold mb-4'>Discover your next adventure</h1>
          <p className='text-lg text-gray-600 mb-6'>AI-powered personalized itineraries tailored to your taste, budget and time.</p>
          <div className='flex gap-4'>
            <Link to='/createtrip' className='px-6 py-3 bg-purple-600 text-white rounded-md shadow'>Get Started</Link>
            <Link to='/contact' className='px-6 py-3 border rounded-md text-gray-700'>Contact Us</Link>
          </div>
        </div>
        <div className='flex-1'>
          <div className='w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300'>
            <img src={tourist} alt='Tourist illustration' className='max-h-64 object-contain' />
          </div>
        </div>
      </section>
    </main>
  )
}
