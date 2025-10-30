import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, MapPin, Calendar, Zap } from 'lucide-react'
import tourist from '@/assets/tourist.jpg'

export default function Homepage(){
  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'>
      {/* Hero Section */}
      <section className='container mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12'>
        <div className='flex-1 space-y-6'>
          <div className='inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm font-semibold shadow-lg'>
            ✨ AI-Powered Travel Planning
          </div>
          <h1 className='text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent leading-tight'>
            Discover Your Next Adventure
          </h1>
          <p className='text-xl text-gray-700 leading-relaxed'>
            Personalized itineraries tailored to your taste, budget, and time. Let AI plan your perfect trip in seconds.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 pt-4'>
            <Link 
              to='/createtrip' 
              className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
            >
              <Sparkles size={20} />
              Get Started Free
            </Link>
            <Link 
              to='/contact' 
              className='inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-purple-600 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-200'
            >
              Contact Us
            </Link>
          </div>
        </div>
        <div className='flex-1'>
          <div className='relative w-full h-96 bg-gradient-to-br from-purple-200 to-blue-200 rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300'>
            <img src={tourist} alt='Tourist illustration' className='w-full h-full object-cover' />
            <div className='absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent'></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='container mx-auto px-6 py-16'>
        <h2 className='text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
          Why Choose Trip Pick?
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-purple-300'>
            <div className='w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4'>
              <Sparkles className='text-white' size={28} />
            </div>
            <h3 className='text-xl font-bold text-gray-800 mb-3'>AI-Powered Planning</h3>
            <p className='text-gray-600'>
              Advanced AI creates personalized itineraries based on your preferences, budget, and travel style.
            </p>
          </div>

          <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-blue-300'>
            <div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4'>
              <MapPin className='text-white' size={28} />
            </div>
            <h3 className='text-xl font-bold text-gray-800 mb-3'>Smart Recommendations</h3>
            <p className='text-gray-600'>
              Get curated suggestions for hotels, flights, activities, and local experiences at your destination.
            </p>
          </div>

          <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-pink-300'>
            <div className='w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4'>
              <Zap className='text-white' size={28} />
            </div>
            <h3 className='text-xl font-bold text-gray-800 mb-3'>Instant Itineraries</h3>
            <p className='text-gray-600'>
              Generate complete travel plans in seconds. Save time and start your adventure faster.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='container mx-auto px-6 py-20'>
        <div className='bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-3xl shadow-2xl p-12 text-center text-white'>
          <h2 className='text-4xl font-bold mb-4'>Ready to Plan Your Dream Trip?</h2>
          <p className='text-xl mb-8 text-white/90'>Join thousands of travelers who trust Trip Pick for their adventures</p>
          <Link 
            to='/createtrip' 
            className='inline-flex items-center gap-2 px-10 py-4 bg-white text-purple-600 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
          >
            <Sparkles size={20} />
            Start Planning Now
          </Link>
        </div>
      </section>
    </main>
  )
}
