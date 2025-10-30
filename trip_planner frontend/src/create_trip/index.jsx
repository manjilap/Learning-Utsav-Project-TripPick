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
      
      // Extract the nested itinerary data from the response
      // Response structure: { itinerary: { ok: true, itinerary: {...} } }
      const itineraryData = result?.itinerary?.itinerary || result?.itinerary || result
      
      // navigate to itinerary page and pass itinerary in router state
      navigate('/itinerary', { state: { itinerary: itineraryData } })
    } catch (err) {
      console.error('Generate failed', err)
      setError(err.message || String(err))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 sm:px-8 lg:px-16 py-12'>
      <div className='max-w-5xl mx-auto'>
        {/* Header Section */}
        <div className='text-center mb-10'>
          <h2 className='font-bold text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3'>
            Plan Your Dream Trip ✨
          </h2>
          <p className='text-gray-600 text-lg max-w-2xl mx-auto'>
            Tell us your travel preferences and we'll create a personalized itinerary just for you
          </p>
        </div>

        <div className='bg-white shadow-2xl rounded-2xl p-8 border border-gray-100'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3'>
                <span className='text-blue-600'>📍</span>
                Your Current City
              </label>
              <GooglePlacesAutocomplete
                apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY}
                selectProps={{
                  value: placeStart,
                  onChange: v => setPlaceStart(v),
                  placeholder: 'Where are you starting from?',
                  styles: {
                    control: (provided) => ({
                      ...provided,
                      borderRadius: '0.75rem',
                      borderColor: '#e5e7eb',
                      padding: '0.25rem',
                      '&:hover': {
                        borderColor: '#3b82f6'
                      }
                    })
                  }
                }}
              />
            </div>

            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3'>
                <span className='text-purple-600'>🌍</span>
                Dream Destination
              </label>
              <GooglePlacesAutocomplete
                apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY}
                selectProps={{
                  value: placeDest,
                  onChange: v => setPlaceDest(v),
                  placeholder: 'Where do you want to explore?',
                  styles: {
                    control: (provided) => ({
                      ...provided,
                      borderRadius: '0.75rem',
                      borderColor: '#e5e7eb',
                      padding: '0.25rem',
                      '&:hover': {
                        borderColor: '#9333ea'
                      }
                    })
                  }
                }}
              />
            </div>

            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3'>
                <span className='text-green-600'>📅</span>
                Number of Days
              </label>
              <Input
                placeholder='e.g. 5 days'
                type='number'
                value={formData.Days || ''}
                onChange={e => handleInputChange('Days', e.target.value)}
                className='w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500'
              />
              <p className='text-xs text-gray-500 mt-2 flex items-center gap-1'>
                <span>💡</span>
                Short trips: 1-3 days • Medium: 4-7 days • Long: 8+ days
              </p>
            </div>

            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3'>
                <span className='text-yellow-600'>💰</span>
                Budget Range
              </label>
              <div className='grid grid-cols-1 gap-3'>
                {SelectBudgetOptions.map((item, index) => {
                  const selected = formData.budget === item.value
                  const btnClass = selected
                    ? 'flex items-center gap-4 p-4 rounded-xl text-left border-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg transform scale-105 transition-all duration-200'
                    : 'flex items-center gap-4 p-4 rounded-xl text-left border-2 border-gray-200 transition-all duration-200 hover:border-purple-400 hover:shadow-md'
                  return (
                    <button
                      aria-pressed={selected}
                      type='button'
                      key={index}
                      onClick={() => handleInputChange('budget', item.value)}
                      className={btnClass}
                    >
                      <span className={`text-3xl ${selected ? 'text-white' : ''}`}>{item.icon}</span>
                      <div className='flex-1'>
                        <div className={`font-bold ${selected ? 'text-lg' : 'text-base'}`}>{item.title}</div>
                        <div className={`text-sm ${selected ? 'text-white/90' : 'text-gray-600'}`}>{item.description}</div>
                      </div>
                      {selected && (
                        <span className='flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white font-bold'>
                          ✓
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className='mt-8'>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-800 mb-4'>
              <span className='text-pink-600'>👥</span>
              Who are you travelling with?
            </label>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {SelectTravelLists.map((item, index) => {
                const selected = formData.travelWith === item.value
                const btnClass = selected
                  ? 'flex flex-col items-center gap-3 p-5 rounded-xl text-center border-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white border-transparent shadow-lg transform scale-105 transition-all duration-200'
                  : 'flex flex-col items-center gap-3 p-5 rounded-xl text-center border-2 border-gray-200 transition-all duration-200 hover:border-purple-400 hover:shadow-md'
                return (
                  <button
                    aria-pressed={selected}
                    type='button'
                    key={index}
                    onClick={() => handleInputChange('travelWith', item.value)}
                    className={btnClass}
                  >
                    <span className={`text-4xl ${selected ? 'text-white' : ''}`}>{item.icon}</span>
                    <div>
                      <div className={`font-bold text-base ${selected ? 'text-white' : 'text-gray-800'}`}>{item.title}</div>
                      <div className={`text-sm mt-1 ${selected ? 'text-white/90' : 'text-gray-600'}`}>{item.description}</div>
                    </div>
                    {selected && (
                      <div className='absolute top-2 right-2 bg-white rounded-full p-1'>
                        <span className='text-purple-600 text-sm'>✓</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className='flex items-center justify-between mt-8'>
            {error && <div className='text-red-500 text-sm font-medium'>{error}</div>}
            <div className='flex-grow' />
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating} 
              className='px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
            >
              {isGenerating ? '⏳ Generating...' : 'Generate Trip ✨'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTrip