import { set } from 'mongoose';
import React, { useEffect } from 'react'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { Input } from "@/components/ui/input"
import { SelectBudgetOptions, SelectTravelLists } from '../constants/options';
import { Button } from '../components/ui/button';
import { handle } from 'express/lib/application';

function CreateTrip() {
  const [place, setplace]=React.useState();
  const [formData, setformData]=React.useState([]);
  
   const handleInputChange=(named, Value)=>{
    setformData({...formData, [named]:Value})
   }
   useEffect(()=> {
    console.log(formData)
   }, [formData])
  return (
    <div classname='sm:px-10 md:px-32 lg:px-40 xl:px-10 px-5 mt-20'>
      <h2 className='font-bold text-3xl'> Tell us your travel preferences 🏝️</h2>
      <p className='mt-3 text-gray-500 text-xl, mx-5'> Provide the details</p>
    <div className='sm:px-10 md:px-32 xl:px-72 px-5 mt-10'> 
      <div>
        <h2 className='text-xl my-3 font-medium'>Your Current City</h2>
        <GooglePlacesAutocomplete
        apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY}/>
      </div>
      <div>
        <h2 className='text-xl my-3 font-medium'>Destination of Your Choice</h2>
        <GooglePlacesAutocomplete
        apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY}
        selectProps={{
          place, 
          onChange:(v)=> {setplace(v); 
          }}}/>
      </div>  

      <div>
        <h2 className='text-xl my-3 font-medium'>Number of Days</h2>
        <Input placeholder='eg. 3' type='number'/>

      </div>

      <div>
        <h2 className='text-xl my-3 font-medium'>What is Your Budget?</h2>
        {SelectBudgetOptions.map((item, index)=>(
        
          <div key={index} className='flex items-center gap-3 border p-3 rounded-lg my-2 cursor-pointer hover:bg-purple-100'>
            <span className='text-3xl'>{item.icon}</span>
            <div>
              <h2 className='font-semibold text-lg'>{item.title}</h2>
              <p className='text-gray-500'>{item.description}</p>
            </div>
          </div>
        ))}

      </div>  

      <div>
        <h2 className='text-xl my-3 font-medium'>Who are you travelling with?</h2>
        {SelectTravelLists.map((item, index)=>(
        
          <div key={index} className='flex  gap-3 border p-3 rounded-lg my-2 cursor-pointer hover:bg-purple-100'>
            <span className='text-3xl'>{item.icon}</span>
            <div>
              <h2 className='font-semibold text-lg'>{item.title}</h2>
              <p className='text-gray-500'>{item.description}</p>
            </div>
          </div>
        ))}

      </div>  

      <div className='flex justify-end  my-4 px-1'>
        <Button > Generate Itinerary</Button>
      </div>
    </div>
    </div>
  )
}

export default CreateTrip