import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SelectBudgetOptions, SelectTravelLists } from '@/constants/options'
import api from '@/service/aimodel'

function CreateTrip() {
  const [placeStart, setPlaceStart] = useState(null)
  const [placeDest, setPlaceDest] = useState(null)
  const [formData, setFormData] = useState({})

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }
   useEffect(()=> {
    console.log(formData)
   }, [formData])
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    setError(null)
    const prefs = {
      origin: placeStart?.label || null,
      destination: placeDest?.label || null,
      Days: formData.Days || formData.days || null,  // Capital D to match backend
      budget: formData.budget || null,
      travelWith: formData.travelWith || null,
    }
    try {
      setIsGenerating(true)
      const result = await api.generateItinerary(prefs)
      // navigate to itinerary page and pass itinerary in router state
      navigate('/itinerary', { state: { itinerary: result } })
    } catch (err) {
      console.error('Generate failed', err)
      setError(err.message || String(err))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className='px-4 sm:px-8 lg:px-16 mt-16'>
      <div className='max-w-4xl mx-auto'>
        <h2 className='font-bold text-3xl'>Tell us your travel preferences 🏝️</h2>
        <p className='mt-2 text-gray-500 text-lg'>Provide a few details and we'll generate a personalised itinerary.</p>

        <div className='bg-white shadow-md rounded-xl mt-8 p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Your Current City</label>
              <GooglePlacesAutocomplete
                apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY}
                selectProps={{
                  value: placeStart,
                  onChange: v => setPlaceStart(v),
                  placeholder: 'Type a city or address',
                }}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Destination</label>
              <GooglePlacesAutocomplete
                apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY}
                selectProps={{
                  value: placeDest,
                  onChange: v => setPlaceDest(v),
                  placeholder: 'Where do you want to go?'
                }}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Number of Days</label>
              <Input
                placeholder='e.g. 3'
                type='number'
                value={formData.Days || ''}
                onChange={e => handleInputChange('Days', e.target.value)}
                className='w-full'
              />
              <p className='text-xs text-gray-400 mt-1'>Tip: shorter trips are usually 1-3 days, medium 4-7 days.</p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Budget</label>
              <div className='grid grid-cols-1 gap-2'>
                {SelectBudgetOptions.map((item, index) => {
                  const selected = formData.budget === item.value
                  const btnClass = selected
                    ? 'flex items-center gap-3 p-3 rounded-lg text-left border bg-purple-600 text-white border-transparent shadow'
                    : 'flex items-center gap-3 p-3 rounded-lg text-left border transition hover:bg-purple-50'
                  return (
                    <button
                      aria-pressed={selected}
                      type='button'
                      key={index}
                      onClick={() => handleInputChange('budget', item.value)}
                      className={btnClass}
                    >
                      <span className={`text-2xl ${selected ? 'text-white' : ''}`}>{item.icon}</span>
                      <div className='flex-1'>
                        <div className={`font-semibold ${selected ? 'font-bold' : ''}`}>{item.title}</div>
                        <div className={`${selected ? 'text-purple-100' : 'text-sm text-gray-500'}`}>{item.description}</div>
                      </div>
                      {selected && (
                        <span className='ml-3 inline-flex items-center px-2 py-1 rounded-full bg-white/20 text-white text-xs'>
                          ✓ Selected
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className='mt-6'>
            <label className='block text-sm font-medium text-gray-700 mb-3'>Who are you travelling with?</label>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              {SelectTravelLists.map((item, index) => {
                const selected = formData.travelWith === item.value
                const btnClass = selected
                  ? 'flex items-start gap-3 p-3 rounded-lg text-left border bg-purple-600 text-white border-transparent shadow'
                  : 'flex items-start gap-3 p-3 rounded-lg text-left border transition hover:bg-purple-50'
                return (
                  <button
                    aria-pressed={selected}
                    type='button'
                    key={index}
                    onClick={() => handleInputChange('travelWith', item.value)}
                    className={btnClass}
                  >
                    <span className={`text-2xl mt-1 ${selected ? 'text-white' : ''}`}>{item.icon}</span>
                    <div className='flex-1'>
                      <div className={`font-semibold ${selected ? 'font-bold' : ''}`}>{item.title}</div>
                      <div className={`${selected ? 'text-purple-100' : 'text-sm text-gray-500'}`}>{item.description}</div>
                    </div>
                    {selected && (
                      <span className='ml-3 inline-flex items-center px-2 py-1 rounded-full bg-white/20 text-white text-xs'>
                        ✓ Selected
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className='flex items-center justify-between mt-6'>
            {error && <div className='text-red-500 mr-4'>{error}</div>}
            <div className='flex-grow' />
            <Button onClick={handleGenerate} disabled={isGenerating} className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg'>
              {isGenerating ? 'Generating...' : 'Generate Itinerary'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTrip