import React from 'react'

function Header() {
  return (
    <div className='p-2 shadow-sm flex justify-between items-center px-5'>
        <img src='trippick_logo.svg' width={150} height={200}/>
        <div>
            <button>Sign In</button>
        </div>
    </div>
  )
}

export default Header