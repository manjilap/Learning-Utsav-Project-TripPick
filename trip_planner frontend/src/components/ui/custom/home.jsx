import React from 'react'
import { Button } from '../button'
import { Link } from 'react-router-dom'

function Welcome() {
  return (
    <div className='flex items-center flex-col mx-36 gap-9 mt-16'>
        <p
        className='font-extrabold text-xxl text-center '>
            <span className='text-[#7600bc]'>Discover your Next Adventure with AI: 
                </span>
                Personalized Itineraries at Your Browser</p>
                <p className='text-xl text -g text-center'> Your Personal trip planner and travel Guide 
                    Get Itineraries tailored to your interest and budget. </p>

                <Link to='/createtrip'>
                <Button> Get Started, Its Free</Button>
                </Link>
        </div>
  )
}

export default Welcome 