import React from 'react'
import { Button } from '../button'
import { Link } from 'react-router-dom'

function Welcome() {
  return (
    <section className='py-20'>
      <div className='container mx-auto px-6 lg:px-12'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 items-center'>
          <div>
            <h1 className='text-4xl sm:text-5xl font-extrabold leading-tight'>
              <span className='text-purple-600'>Discover your next adventure</span>
              <br />
              Personalized itineraries powered by AI
            </h1>
            <p className='mt-6 text-gray-600 text-lg'>Plan trips tailored to your interests, budget, and travel style in seconds. Compare hotels, flights, activities and get packing suggestions.</p>

            <div className='mt-8 flex gap-4'>
              <Link to='/createtrip'>
                <Button className='px-6 py-3 bg-purple-600 text-white'>Get Started — It's free</Button>
              </Link>
              <Link to='/contact' className='inline-flex items-center px-5 py-3 border rounded-md text-sm hover:bg-gray-50'>Contact Sales</Link>
            </div>

            <div className='mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='flex items-start gap-3'>
                <div className='text-2xl'>✈️</div>
                <div>
                  <div className='font-semibold'>Flights & hotels</div>
                  <div className='text-sm text-gray-500'>Smart recommendations and estimates.</div>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <div className='text-2xl'>🗺️</div>
                <div>
                  <div className='font-semibold'>Custom itineraries</div>
                  <div className='text-sm text-gray-500'>Day-by-day plans that match your pace.</div>
                </div>
              </div>
            </div>
          </div>

          <div className='order-first lg:order-last'>
            <div className='bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6'>
              <img src='/hero_placeholder.svg' alt='Travel illustration' className='w-full h-64 object-cover rounded-md' />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Welcome